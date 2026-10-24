"use client";

import Link from "next/link";
import { Camera, CameraOff, Download, LoaderCircle, Sparkles, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type ChangeEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import type { TryOnDress } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { PARTS } from "@/lib/try-on/assets";
import { PORTRAIT_CONSENT } from "@/lib/try-on/portrait";

type Copy = Dictionary["portrait"];
type Props = { dresses: TryOnDress[]; copy: Copy; signedIn: boolean; enabled: boolean; testMode?: boolean };
export function PortraitStudio(props: Props) {
  const requestedSlug = useSearchParams().get("dress") ?? "";
  return <PortraitForm key={requestedSlug} {...props} requestedSlug={requestedSlug} />;
}
function PortraitForm({ dresses, copy, signedIn, enabled, testMode = false, requestedSlug }: Props & { requestedSlug: string }) {
  const id = useId();
  const [slug, setSlug] = useState(dresses.find((dress) => dress.slug === requestedSlug)?.slug ?? dresses[0]?.slug ?? "");
  const [camera, setCamera] = useState(false), [starting, setStarting] = useState(false), [busy, setBusy] = useState(false), [consent, setConsent] = useState(false);
  const [face, setFace] = useState<File | null>(null), [preview, setPreview] = useState<string | null>(null), [result, setResult] = useState<string | null>(null);
  const [cameraAspect, setCameraAspect] = useState("3 / 4");
  const [error, setError] = useState<keyof Copy["errors"] | null>(null), [remaining, setRemaining] = useState<number | null>(null);
  const video = useRef<HTMLVideoElement>(null), stream = useRef<MediaStream | null>(null), request = useRef(0), alive = useRef(false), abort = useRef<AbortController | null>(null);
  const dress = dresses.find((item) => item.slug === slug) ?? dresses[0];
  function release() { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; }
  const cancelCamera = useCallback(() => { request.current++; stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; }, []);
  function stop() { cancelCamera(); if (video.current) video.current.srcObject = null; setCamera(false); setStarting(false); }
  function cancelGeneration() { abort.current?.abort(); abort.current = null; setBusy(false); }
  useEffect(() => { alive.current = true; return () => {
    alive.current = false; cancelCamera(); abort.current?.abort();
    // Next Activity can preserve page state after navigation. Discard private
    // media so returning does not retain a face or a revoked object URL.
    setFace(null); setPreview(null); setResult(null); setConsent(false);
    setCamera(false); setStarting(false); setBusy(false);
  }; }, [cancelCamera]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result); }, [result]);
  useEffect(() => {
    function hide() { if (document.hidden) { cancelCamera(); if (video.current) video.current.srcObject = null; setCamera(false); setStarting(false); } }
    document.addEventListener("visibilitychange", hide); return () => document.removeEventListener("visibilitychange", hide);
  }, [cancelCamera]);
  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) { setError("no_camera"); return; }
    const token = ++request.current; setStarting(true);
    let acquired: MediaStream | null = null;
    try {
      acquired = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1440 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 3 / 4 },
        },
        audio: false,
      });
      if (!alive.current || token !== request.current) { acquired.getTracks().forEach((t) => t.stop()); return; }
      release(); stream.current = acquired;
      // Autofocus is optional and not consistently exposed by browsers. Ask
      // capable cameras for continuous focus while keeping all capture usable.
      const track = acquired.getVideoTracks()[0];
      if (track) {
        type FocusCapabilities = MediaTrackCapabilities & { focusMode?: string[] };
        type FocusConstraints = MediaTrackConstraintSet & { focusMode?: string };
        const modes = (track.getCapabilities() as FocusCapabilities).focusMode ?? [];
        if (modes.includes("continuous")) {
          try { await track.applyConstraints({ advanced: [{ focusMode: "continuous" } as FocusConstraints] }); } catch { /* Camera may reject optional focus control. */ }
        }
      }
      if (!video.current) { release(); return; }
      video.current.srcObject = acquired; await video.current.play();
      if (!alive.current || token !== request.current) { acquired.getTracks().forEach((t) => t.stop()); return; }
      if (video.current.videoWidth && video.current.videoHeight) setCameraAspect(`${video.current.videoWidth} / ${video.current.videoHeight}`);
      setCamera(true);
    } catch { acquired?.getTracks().forEach((t) => t.stop()); if (alive.current && token === request.current) setError("camera_denied"); }
    finally { if (alive.current && token === request.current) setStarting(false); }
  }
  function acceptFace(file: File) { cancelGeneration(); setFace(file); setPreview(URL.createObjectURL(file)); setResult(null); setConsent(false); setError(null); stop(); }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 15_000_000) { setError("invalid_photo"); return; }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = url; await image.decode();
      if (Math.min(image.naturalWidth, image.naturalHeight) < 192 || image.naturalWidth * image.naturalHeight > 25_000_000) throw new Error("dimensions");
      const scale = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas"); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale);
      canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob || !alive.current) return;
      acceptFace(new File([blob], "face.jpg", { type: "image/jpeg" }));
    } catch { setError("invalid_photo"); } finally { URL.revokeObjectURL(url); }
  }
  async function capture() {
    const source = video.current; if (!source?.videoWidth) return;
    const scale = Math.min(1, 1024 / source.videoWidth);
    const canvas = document.createElement("canvas"); canvas.width = Math.round(source.videoWidth * scale); canvas.height = Math.round(source.videoHeight * scale);
    const ctx = canvas.getContext("2d")!; ctx.translate(canvas.width, 0); ctx.scale(-1, 1); ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (blob && alive.current) acceptFace(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
  }
  async function generate() {
    if (!face || !consent || !dress || busy) return;
    const controller = new AbortController(); abort.current = controller; setBusy(true); setError(null); setResult(null);
    const form = new FormData(); form.set("face", face); form.set("dress", dress.slug); form.set("consent", PORTRAIT_CONSENT);
    try {
      const response = await fetch("/api/try-on/generate", { method: "POST", body: form, signal: controller.signal });
      if (!response.ok) { const body = await response.json(); const code = body.error?.code; setError(code in copy.errors ? code : "generation_failed"); return; }
      if (!response.headers.get("content-type")?.startsWith("image/")) throw new Error("image");
      const blob = await response.blob(); if (controller.signal.aborted || !alive.current) return;
      setResult(URL.createObjectURL(blob)); setRemaining(Number(response.headers.get("X-AI-Remaining")));
    } catch { if (!controller.signal.aborted && alive.current) setError("generation_failed"); }
    finally { if (alive.current && abort.current === controller) { abort.current = null; setBusy(false); } }
  }
  if (!dress) return <p>{copy.noDresses}</p>;
  const button = "inline-flex min-h-12 items-center justify-center gap-2 rounded border border-ink px-4 text-label-md hover:bg-surface-container disabled:opacity-50";
  return <div className="flex min-w-0 flex-col gap-6">
    {testMode ? <p role="status" className="rounded border border-ink p-3 text-body-sm">{copy.testMode}</p> : null}
    <section className="flex flex-col gap-3" aria-labelledby={`${id}-outfit`}>
      <h2 id={`${id}-outfit`} className="font-serif text-headline-md">{copy.chooseHeading}</h2>
      <label htmlFor={`${id}-dress`} className="text-label-md">{copy.chooseDress}</label>
      <select id={`${id}-dress`} disabled={busy} value={dress.slug} onChange={(e) => { setSlug(e.target.value); setResult(null); }} className="min-h-12 min-w-0 w-full rounded border border-ink bg-surface-container-lowest px-3">{dresses.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select>
      <p className="text-body-sm text-on-surface-variant">{copy.outfitNote}</p>
      <div className="grid grid-cols-3 gap-2">{PARTS.map((part) => <figure key={part} className="min-w-0 rounded border border-ink bg-surface-container-low p-2">
        {/* Transparent fixed local references, no user photos or remote optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dress.parts[part]} alt={`${dress.title} · ${copy.parts[part]}`} className="h-28 w-full object-contain" />
        <figcaption className="mt-2 text-center text-body-sm">{copy.parts[part]}</figcaption>
      </figure>)}</div>
    </section>
    <section className="flex flex-col gap-3" aria-labelledby={`${id}-face`}>
      <h2 id={`${id}-face`} className="font-serif text-headline-md">{copy.faceHeading}</h2>
      <p className="text-body-md text-on-surface-variant">{copy.faceGuide}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={camera ? stop : start} disabled={starting || busy} className={button}>{camera ? <CameraOff aria-hidden size={18} /> : <Camera aria-hidden size={18} />}{starting ? copy.starting : camera ? copy.stopCamera : copy.startCamera}</button>
        <label className={`${button} cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary`}><Upload aria-hidden size={18} />{copy.upload}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload} className="sr-only" /></label>
      </div>
      <video ref={video} autoPlay playsInline muted aria-label={copy.cameraPreview} className={`${camera ? "" : "hidden"} mx-auto max-h-[70vh] w-full max-w-md rounded border border-ink bg-surface-container-highest object-contain`} style={{ aspectRatio: cameraAspect, transform: "scaleX(-1)" }} />
      {camera ? <button type="button" onClick={capture} className={`${button} bg-primary text-on-primary hover:opacity-90`}><Camera aria-hidden size={18} />{copy.capture}</button> : null}
      {/* Face object URLs remain local until explicit Generate + consent. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {preview ? <img src={preview} alt={copy.facePreview} className="mx-auto max-h-72 max-w-full rounded border border-ink object-contain" /> : null}
      {preview ? <button type="button" disabled={busy} onClick={() => { setFace(null); setPreview(null); setResult(null); setConsent(false); }} className={button}>{copy.removePhoto}</button> : null}
    </section>
    <section className="flex flex-col gap-3" aria-labelledby={`${id}-generate`}>
      <h2 id={`${id}-generate`} className="font-serif text-headline-md">{copy.generateHeading}</h2>
      <label className="flex min-h-12 items-start gap-3 text-body-md"><input type="checkbox" checked={consent} disabled={busy} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--color-primary)]" /><span>{copy.consent}</span></label>
      <p className="text-body-sm text-on-surface-variant">{copy.quotaNote}{remaining !== null ? ` ${copy.remaining.replace("{n}", String(remaining))}` : ""}</p>
      {!signedIn ? <Link href="/login?next=%2Ftry-on" className={`${button} bg-primary text-on-primary hover:opacity-90`}>{copy.signIn}</Link> : <button type="button" disabled={!face || !consent || busy || !enabled} onClick={generate} className={`${button} bg-primary text-on-primary hover:opacity-90`}>{busy ? <LoaderCircle aria-hidden size={18} className="animate-spin motion-reduce:animate-none" /> : <Sparkles aria-hidden size={18} />}{busy ? copy.generating : copy.generate}</button>}
      {!enabled ? <p className="text-body-sm text-on-surface-variant">{copy.setupRequired}</p> : null}
      {busy ? <><p role="status" className="text-body-md">{copy.wait}</p><button type="button" onClick={cancelGeneration} className={button}>{copy.cancel}</button></> : null}
      {error ? <p role="alert" className="rounded border border-ink bg-surface-container-highest p-3 text-body-md">{copy.errors[error]}</p> : null}
    </section>
    {result ? <section className="flex flex-col gap-3" aria-labelledby={`${id}-result`}>
      <h2 id={`${id}-result`} className="font-serif text-headline-md">{copy.resultHeading}</h2>
      {/* Private generated bytes are only a browser object URL, never a public storage URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={result} alt={copy.resultAlt.replace("{name}", dress.title)} className="mx-auto h-auto max-h-[48rem] w-full rounded border border-ink object-contain" />
      <a href={result} download={`nusantara-${dress.slug}-ai.webp`} className={`${button} bg-primary text-on-primary hover:opacity-90`}><Download aria-hidden size={18} />{copy.download}</a>
      <p className="text-body-sm text-on-surface-variant">{copy.resultNote}</p>
    </section> : null}
  </div>;
}
