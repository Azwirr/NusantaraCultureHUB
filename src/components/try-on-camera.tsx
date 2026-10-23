"use client";

import { Camera, CameraOff, FlipHorizontal, RotateCcw } from "lucide-react";
import { type PointerEvent, useEffect, useId, useRef, useState } from "react";

import type { TryOnDress } from "@/lib/content";
import { sizedImage } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Copy = Dictionary["tryOn"] & Dictionary["common"];

const START = { size: 100, x: 0, y: 10 };

/**
 * The try-on studio: the browser camera with a licensed dress picture laid
 * over it. Frames never leave the device and nothing is recorded (PRD privacy
 * rule). There is no pose detection: the member lines the dress up with
 * their body by dragging it or with the size and position sliders.
 */
export function TryOnCamera({ dresses, copy }: { dresses: TryOnDress[]; copy: Copy }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; x: number; y: number } | null>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(dresses[0]?.slug ?? "");
  const [opacity, setOpacity] = useState(70);
  const [mirror, setMirror] = useState(true);
  const [size, setSize] = useState(START.size);
  const [x, setX] = useState(START.x);
  const [y, setY] = useState(START.y);
  const ids = { select: useId(), opacity: useId(), size: useId(), x: useId(), y: useId() };
  const dress = dresses.find((item) => item.slug === slug) ?? dresses[0];

  function release() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function stop() {
    release();
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  async function start() {
    setError(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError(copy.noCamera);
      return;
    }
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        // Some browsers (iOS Safari) only start a stream on an explicit play().
        await video.play().catch(() => {});
      }
      setActive(true);
    } catch (cause) {
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotFoundError" || name === "OverconstrainedError" ? copy.noCamera : copy.cameraDenied);
    } finally {
      setStarting(false);
    }
  }

  function reset() {
    setSize(START.size);
    setX(START.x);
    setY(START.y);
  }

  // Drag the dress with a finger or the mouse; positions are a percentage of the stage.
  function onPointerDown(event: PointerEvent<HTMLImageElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x, y };
  }
  function onPointerMove(event: PointerEvent<HTMLImageElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !stage) return;
    const box = stage.getBoundingClientRect();
    const clamp = (value: number) => Math.max(-50, Math.min(50, value));
    setX(clamp(drag.x + ((event.clientX - drag.startX) / box.width) * 100));
    setY(clamp(drag.y + ((event.clientY - drag.startY) / box.height) * 100));
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  // Release the camera when the member leaves the page.
  useEffect(() => release, []);

  if (!dress) {
    return <p className="text-body-lg text-on-surface">{copy.noDresses}</p>;
  }

  const slider = "h-12 w-full accent-[var(--color-primary)]";
  const label = "flex flex-col gap-1 text-label-md text-on-surface";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <label htmlFor={ids.select} className={label}>
          {copy.chooseDress}
          <select
            id={ids.select}
            value={dress.slug}
            onChange={(event) => setSlug(event.target.value)}
            className="min-h-12 rounded border border-ink bg-surface-container-lowest px-3 text-body-md"
          >
            {dresses.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        {active ? (
          <button
            type="button"
            onClick={stop}
            className="press inline-flex min-h-12 items-center gap-2 rounded border border-ink bg-surface-container-lowest px-4 text-label-md text-on-surface hover:bg-surface-container"
          >
            <CameraOff aria-hidden="true" size={18} strokeWidth={1.75} />
            {copy.stopCamera}
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={starting}
            className="press inline-flex min-h-12 items-center gap-2 rounded border border-ink bg-primary px-4 text-label-md text-on-primary hover:opacity-90 disabled:opacity-60"
          >
            <Camera aria-hidden="true" size={18} strokeWidth={1.75} />
            {copy.startCamera}
          </button>
        )}
        <button
          type="button"
          aria-pressed={mirror}
          onClick={() => setMirror((value) => !value)}
          className="press inline-flex min-h-12 items-center gap-2 rounded border border-ink px-4 text-label-md text-on-surface hover:bg-surface-container"
        >
          <FlipHorizontal aria-hidden="true" size={18} strokeWidth={1.75} />
          {copy.mirror}
        </button>
      </div>

      {error ? (
        <p role="alert" className="rounded border border-ink bg-surface-container-highest px-4 py-3 text-body-md text-on-surface">
          {error}
        </p>
      ) : null}

      <div
        ref={stageRef}
        className="relative mx-auto aspect-[3/4] w-full max-w-md touch-none overflow-hidden rounded border border-ink bg-surface-container-highest"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label={copy.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: mirror ? "scaleX(-1)" : undefined }}
        />
        {active ? (
          // Reviewed, licensed picture laid over the camera; plain img keeps remote hosts out of next/image config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sizedImage(dress.imageUrl, 900)}
            alt={dress.title}
            draggable={false}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="absolute inset-0 h-full w-full cursor-grab select-none object-contain active:cursor-grabbing"
            style={{ opacity: opacity / 100, transform: `translate(${x}%, ${y}%) scale(${size / 100})` }}
          />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-body-md text-on-surface-variant">
            {copy.liveNote}
          </p>
        )}
      </div>

      {active ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label htmlFor={ids.opacity} className={label}>
            {copy.overlay}
            <input id={ids.opacity} type="range" min={10} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className={slider} />
          </label>
          <label htmlFor={ids.size} className={label}>
            {copy.size}
            <input id={ids.size} type="range" min={40} max={200} value={size} onChange={(event) => setSize(Number(event.target.value))} className={slider} />
          </label>
          <label htmlFor={ids.x} className={label}>
            {copy.moveX}
            <input id={ids.x} type="range" min={-50} max={50} value={Math.round(x)} onChange={(event) => setX(Number(event.target.value))} className={slider} />
          </label>
          <label htmlFor={ids.y} className={label}>
            {copy.moveY}
            <input id={ids.y} type="range" min={-50} max={50} value={Math.round(y)} onChange={(event) => setY(Number(event.target.value))} className={slider} />
          </label>
          <button
            type="button"
            onClick={reset}
            className="press inline-flex min-h-12 items-center justify-center gap-2 rounded border border-ink px-4 text-label-md text-on-surface hover:bg-surface-container sm:col-span-2"
          >
            <RotateCcw aria-hidden="true" size={18} strokeWidth={1.75} />
            {copy.reset}
          </button>
        </div>
      ) : null}

      <p className="text-body-sm text-on-surface-variant">
        {copy.liveNote} {`${dress.title}: ${dress.credit}, ${dress.licence}.`}
      </p>
    </div>
  );
}
