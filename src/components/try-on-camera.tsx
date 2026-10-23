"use client";

import { Camera, CameraOff, Download, FlipHorizontal, RotateCcw, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type ChangeEvent, type PointerEvent, useEffect, useId, useRef, useState } from "react";
import type { TryOnDress } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { PARTS } from "@/lib/try-on/assets";
import { adjustedBox, coverCrop, DEFAULT_ADJUSTMENT, manualBoxes, poseBoxes, projectPose, type Adjustment, type Part, type Point } from "@/lib/try-on/geometry";

type Copy = Dictionary["tryOn"] & Dictionary["common"];
type Outfit = { slug: string; adjustments: Record<Part, Adjustment>; visible: Record<Part, boolean> };
const outfit = (slug: string): Outfit => ({ slug, adjustments: { head: { ...DEFAULT_ADJUSTMENT }, top: { ...DEFAULT_ADJUSTMENT }, bottom: { ...DEFAULT_ADJUSTMENT } }, visible: { head: true, top: true, bottom: true } });
const W = 750, H = 1000;

/** Camera, pose inference, composition and export stay on this device. */
export function TryOnCamera({ dresses, copy }: { dresses: TryOnDress[]; copy: Copy }) {
  const query = useSearchParams();
  const initial = dresses.find((d) => d.slug === query.get("dress"))?.slug ?? dresses[0]?.slug ?? "";
  const [outfits, setOutfits] = useState<Outfit[]>(() => [outfit(initial), outfit(dresses[1]?.slug ?? initial)]);
  const [person, setPerson] = useState(0), [couple, setCouple] = useState(false), [part, setPart] = useState<Part>("top");
  const [active, setActive] = useState(false), [starting, setStarting] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null), [mirror, setMirror] = useState(true), [opacity, setOpacity] = useState(100);
  const [auto, setAuto] = useState(true), [tracking, setTracking] = useState<"loading" | "ready" | "error">("loading");
  const [poses, setPoses] = useState<Point[][]>([]), [error, setError] = useState<string | null>(null), [exporting, setExporting] = useState(false);
  const [sourceSize, setSourceSize] = useState({ width: 0, height: 0 });
  const videoRef = useRef<HTMLVideoElement>(null), photoRef = useRef<HTMLImageElement>(null), stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null), requestRef = useRef(0), mountedRef = useRef(false);
  const dragRef = useRef<{ id: number; part: Part; person: number; x: number; y: number; adjustment: Adjustment } | null>(null);
  const id = useId(), current = outfits[person];
  const dress = dresses.find((d) => d.slug === current.slug) ?? dresses[0];
  const hasSource = active || !!photo;

  function release() { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; }
  function cancelPending() { requestRef.current++; release(); }
  function stop() { requestRef.current++; release(); if (videoRef.current) videoRef.current.srcObject = null; setActive(false); setPoses([]); setStarting(false); }
  async function start() {
    setError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setError(copy.noCamera); return; }
    const request = ++requestRef.current; setStarting(true);
    let acquired: MediaStream | null = null;
    const discard = () => { if (acquired && streamRef.current === acquired) release(); else acquired?.getTracks().forEach((track) => track.stop()); };
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
      acquired = stream;
      if (!mountedRef.current || request !== requestRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      release(); streamRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => { if (streamRef.current === stream) stop(); });
      const video = videoRef.current; if (!video) { release(); return; }
      video.srcObject = stream; await video.play();
      if (request !== requestRef.current || !mountedRef.current) { discard(); return; }
      setPhoto(null); setActive(true); setTracking("loading");
    } catch (cause) {
      discard();
      if (mountedRef.current && request === requestRef.current) {
        const name = cause instanceof DOMException ? cause.name : "";
        setError(name === "NotFoundError" || name === "OverconstrainedError" ? copy.noCamera : copy.cameraDenied);
      }
    } finally { if (mountedRef.current && request === requestRef.current) setStarting(false); }
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 15 * 1024 * 1024) { setError(copy.photoError); return; }
    const url = URL.createObjectURL(file);
    const request = ++requestRef.current;
    try {
      const image = new Image(); image.src = url; await image.decode();
      if (!mountedRef.current || request !== requestRef.current) { URL.revokeObjectURL(url); return; }
      stop(); setPhoto(url); setMirror(false); setError(null); setTracking("loading");
    } catch { URL.revokeObjectURL(url); setError(copy.photoError); }
  }
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; cancelPending(); }; }, []);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  useEffect(() => {
    function hidden() { if (document.hidden) { requestRef.current++; release(); if (videoRef.current) videoRef.current.srcObject = null; setActive(false); setPoses([]); setStarting(false); } }
    document.addEventListener("visibilitychange", hidden); return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  // One frame in flight, <=4fps, inference off the UI thread. Lazy same-origin model.
  useEffect(() => {
    if (!hasSource || !auto) return;
    let worker: Worker, disposed = false, ready = false, busy = false, last = 0, frame = 0;
    const fail = () => { if (!disposed) { ready = false; setTracking("error"); setPoses([]); } };
    try { worker = new Worker("/try-on/pose-worker.js"); } catch { fail(); return; }
    const timeout = window.setTimeout(fail, 30_000);
    worker.onerror = fail;
    worker.onmessage = ({ data }) => {
      if (disposed) return;
      if (data.type === "ready") { clearTimeout(timeout); ready = true; setTracking("ready"); }
      else if (data.type === "poses") { busy = false; setPoses(data.landmarks); }
      else if (data.type === "error") { busy = false; clearTimeout(timeout); fail(); }
    };
    worker.postMessage({ type: "init" });
    const tick = async (time: number) => {
      frame = requestAnimationFrame(tick);
      const source = active ? videoRef.current : photoRef.current;
      if (!source || !ready || busy || time - last < 250 || (source instanceof HTMLVideoElement ? source.readyState < 2 : !source.complete)) return;
      busy = true; last = time;
      try {
        const image = await createImageBitmap(source);
        if (disposed) { image.close(); return; }
        worker.postMessage({ type: "frame", image, time }, [image]);
      } catch { busy = false; fail(); }
    };
    frame = requestAnimationFrame(tick);
    return () => { disposed = true; cancelAnimationFrame(frame); clearTimeout(timeout); worker.terminate(); };
  }, [active, photo, auto, hasSource]);

  function update(index: number, callback: (item: Outfit) => Outfit) { setOutfits((items) => items.map((item, i) => i === index ? callback(item) : item)); }
  function adjust(patch: Partial<Adjustment>, index = person, selected = part) { update(index, (item) => ({ ...item, adjustments: { ...item.adjustments, [selected]: { ...item.adjustments[selected], ...patch } } })); }
  const sourceWidth = sourceSize.width, sourceHeight = sourceSize.height;
  const tracked = auto && tracking === "ready" && sourceWidth && sourceHeight ? poses.map((points) => poseBoxes(projectPose(points, sourceWidth, sourceHeight, W, H, mirror))).filter((box) => box !== null).sort((a, b) => a.top.x - b.top.x) : [];
  const layers = outfits.slice(0, couple ? 2 : 1).flatMap((item, index) => {
    const selected = dresses.find((d) => d.slug === item.slug) ?? dresses[0]; if (!selected) return [];
    const boxes = tracked[index] ?? manualBoxes(W, H, index, couple);
    return PARTS.filter((key) => item.visible[key]).map((key) => ({ person: index, part: key, url: selected.parts[key], title: selected.title, adjustment: item.adjustments[key], box: adjustedBox(boxes[key], item.adjustments[key], W, H) }));
  });
  function pointerDown(event: PointerEvent<HTMLImageElement>, index: number, selected: Part) {
    event.currentTarget.setPointerCapture(event.pointerId); setPerson(index); setPart(selected);
    dragRef.current = { id: event.pointerId, part: selected, person: index, x: event.clientX, y: event.clientY, adjustment: outfits[index].adjustments[selected] };
  }
  function pointerMove(event: PointerEvent<HTMLImageElement>) {
    const drag = dragRef.current, stage = stageRef.current; if (!drag || drag.id !== event.pointerId || !stage) return;
    const bounds = stage.getBoundingClientRect(), clamp = (n: number) => Math.max(-60, Math.min(60, n));
    adjust({ x: clamp(drag.adjustment.x + (event.clientX - drag.x) / bounds.width * 100), y: clamp(drag.adjustment.y + (event.clientY - drag.y) / bounds.height * 100) }, drag.person, drag.part);
  }
  async function download() {
    const source = active ? videoRef.current : photoRef.current;
    if (!source || !sourceWidth || !sourceHeight) return; setExporting(true); setError(null);
    try {
      const images = await Promise.all(layers.map(async (layer) => { const image = new Image(); image.src = layer.url; await image.decode(); return { layer, image }; }));
      const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("canvas");
      const crop = coverCrop(sourceWidth, sourceHeight, W, H);
      ctx.save(); if (mirror) { ctx.translate(W, 0); ctx.scale(-1, 1); }
      ctx.drawImage(source, crop.x, crop.y, sourceWidth * crop.scale, sourceHeight * crop.scale); ctx.restore();
      for (const { layer, image } of images) {
        const { x, y, width, height } = layer.box;
        ctx.save(); ctx.globalAlpha = opacity / 100; ctx.translate(x + width / 2, y + height / 2); ctx.rotate(layer.adjustment.rotation * Math.PI / 180);
        ctx.drawImage(image, -width / 2, -height / 2, width, height); ctx.restore();
      }
      ctx.fillStyle = "rgba(17,34,52,0.85)"; ctx.fillRect(0, H - 58, W, 58);
      ctx.fillStyle = "#fff9ec"; ctx.font = "18px sans-serif"; ctx.fillText("Nusantara Culture Hub · AI costume illustration", 18, H - 24);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((v) => v ? resolve(v) : reject(new Error("export")), "image/png"));
      const url = URL.createObjectURL(blob), anchor = document.createElement("a"); anchor.href = url; anchor.download = "nusantara-try-on.png"; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch { setError(copy.downloadError); } finally { setExporting(false); }
  }
  if (!dress) return <p>{copy.noDresses}</p>;
  const button = "press inline-flex min-h-12 items-center justify-center gap-2 rounded border border-ink px-4 text-label-md hover:bg-surface-container disabled:opacity-60";
  const label = "flex min-w-0 flex-col gap-1 text-label-md", input = "min-h-12 min-w-0 w-full rounded border border-ink bg-surface-container-lowest px-3";
  const adjustment = current.adjustments[part];
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={active ? stop : start} disabled={starting} className={`${button} bg-primary text-on-primary hover:opacity-90`}>{active ? <CameraOff aria-hidden size={18} /> : <Camera aria-hidden size={18} />}{starting ? copy.starting : active ? copy.stopCamera : copy.startCamera}</button>
        <label className={`${button} cursor-pointer`}><Upload aria-hidden size={18} />{copy.uploadPhoto}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="sr-only" /></label>
        <button type="button" aria-pressed={mirror} onClick={() => setMirror((v) => !v)} className={button}><FlipHorizontal aria-hidden size={18} />{copy.mirror}</button>
      </div>
      {error ? <p role="alert" className="rounded border border-ink bg-surface-container-highest p-3">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label} htmlFor={`${id}-mode`}>{copy.mode}<select id={`${id}-mode`} className={input} value={couple ? "couple" : "solo"} onChange={(e) => { setCouple(e.target.value === "couple"); setPerson(0); }}><option value="solo">{copy.solo}</option><option value="couple">{copy.couple}</option></select></label>
        {couple ? <label className={label} htmlFor={`${id}-person`}>{copy.editPerson}<select id={`${id}-person`} className={input} value={person} onChange={(e) => setPerson(Number(e.target.value))}><option value={0}>{copy.personOne}</option><option value={1}>{copy.personTwo}</option></select></label> : null}
        <label className={`${label} sm:col-span-2`} htmlFor={`${id}-dress`}>{copy.chooseDress}<select id={`${id}-dress`} className={input} value={dress.slug} onChange={(e) => update(person, (item) => ({ ...item, slug: e.target.value }))}>{dresses.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label>
      </div>
      <div ref={stageRef} className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded border border-ink bg-surface-container-highest">
        <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={(e) => setSourceSize({ width: e.currentTarget.videoWidth, height: e.currentTarget.videoHeight })} aria-label={copy.title} className={`absolute inset-0 h-full w-full object-cover ${active ? "" : "invisible"}`} style={{ transform: mirror ? "scaleX(-1)" : undefined }} />
        {/* User photos bypass all image optimizers and network uploads. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo ? <img ref={photoRef} src={photo} onLoad={(e) => setSourceSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })} alt={copy.yourPhoto} className="absolute inset-0 h-full w-full object-cover" style={{ transform: mirror ? "scaleX(-1)" : undefined }} /> : null}
        {!hasSource ? <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-body-md text-on-surface-variant">{copy.instructions}</p> : null}
        {layers.map((layer) => (
          // Same-origin RGBA sprites preserve alpha and canvas export parity.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${layer.person}-${layer.part}`} data-part={layer.part} data-person={layer.person} src={layer.url} alt={`${layer.title} · ${copy.parts[layer.part]}`} draggable={false} onPointerDown={(e) => pointerDown(e, layer.person, layer.part)} onPointerMove={pointerMove} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }} className={`absolute cursor-grab touch-none select-none active:cursor-grabbing ${hasSource ? "" : "pointer-events-none"}`} style={{ left: `${layer.box.x / W * 100}%`, top: `${layer.box.y / H * 100}%`, width: `${layer.box.width / W * 100}%`, height: `${layer.box.height / H * 100}%`, opacity: hasSource ? opacity / 100 : 0.2, transform: `rotate(${layer.adjustment.rotation}deg)`, objectFit: "fill" }} />
        ))}
      </div>
      <label className="flex min-h-12 items-center gap-3 text-body-md"><input type="checkbox" checked={auto} onChange={(e) => { setAuto(e.target.checked); setTracking("loading"); setPoses([]); }} className="size-5 accent-[var(--color-primary)]" />{copy.autoFit}</label>
      <p role="status" className="text-body-sm text-on-surface-variant">{!hasSource ? copy.instructions : !auto ? copy.manualNote : tracking === "loading" ? copy.modelLoading : tracking === "error" ? copy.modelError : tracked.length ? copy.tracking : copy.noPose}</p>
      <fieldset className="flex flex-wrap gap-x-5 gap-y-2"><legend className="mb-2 text-label-md">{copy.visibleParts}</legend>{PARTS.map((key) => <label key={key} className="flex min-h-12 items-center gap-2"><input type="checkbox" checked={current.visible[key]} onChange={(e) => update(person, (item) => ({ ...item, visible: { ...item.visible, [key]: e.target.checked } }))} className="size-5 accent-[var(--color-primary)]" />{copy.parts[key]}</label>)}</fieldset>
      <label className={label} htmlFor={`${id}-part`}>{copy.editPart}<select id={`${id}-part`} className={input} value={part} onChange={(e) => setPart(e.target.value as Part)}>{PARTS.map((key) => <option key={key} value={key}>{copy.parts[key]}</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-2">
        {([ ["size", copy.size, 40, 200], ["x", copy.moveX, -60, 60], ["y", copy.moveY, -60, 60], ["rotation", copy.rotation, -45, 45] ] as const).map(([key, text, min, max]) => <label key={key} className={label} htmlFor={`${id}-${key}`}>{text}<input id={`${id}-${key}`} type="range" min={min} max={max} value={Math.round(adjustment[key])} onChange={(e) => adjust({ [key]: Number(e.target.value) })} className="h-12 w-full accent-[var(--color-primary)]" /></label>)}
        <label className={label} htmlFor={`${id}-opacity`}>{copy.overlay}<input id={`${id}-opacity`} type="range" min={10} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="h-12 w-full accent-[var(--color-primary)]" /></label>
        <button type="button" onClick={() => update(person, (item) => outfit(item.slug))} className={button}><RotateCcw aria-hidden size={18} />{copy.reset}</button>
      </div>
      <button type="button" onClick={download} disabled={!hasSource || exporting} className={`${button} bg-primary text-on-primary hover:opacity-90`}><Download aria-hidden size={18} />{exporting ? copy.saving : copy.download}</button>
      <p className="text-body-sm text-on-surface-variant">{copy.liveNote} {copy.artNote}</p>
    </div>
  );
}
