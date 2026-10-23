"use client";

import { Camera, CameraOff, FlipHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import type { TryOnDress } from "@/lib/content";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Copy = Dictionary["tryOn"] & Dictionary["common"];

/**
 * The try-on studio: the browser camera with a licensed dress picture laid
 * over it. Frames never leave the device and nothing is recorded (PRD privacy
 * rule). The overlay is a line-up aid, not a fitting: no pose detection.
 */
export function TryOnCamera({ dresses, copy }: { dresses: TryOnDress[]; copy: Copy }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(dresses[0]?.slug ?? "");
  const [opacity, setOpacity] = useState(55);
  const [mirror, setMirror] = useState(true);
  const selectId = useId();
  const opacityId = useId();
  const dress = dresses.find((item) => item.slug === slug) ?? dresses[0];

  function stop() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(copy.noCamera);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setActive(true);
    } catch {
      setError(copy.cameraDenied);
    }
  }

  // Release the camera when the member leaves the page.
  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  if (dresses.length === 0) {
    return <p className="text-body-lg text-on-surface">{copy.noDresses}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <label htmlFor={selectId} className="flex flex-col gap-1 text-label-md text-on-surface">
          {copy.chooseDress}
          <select
            id={selectId}
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
        <label htmlFor={opacityId} className="flex flex-col gap-1 text-label-md text-on-surface">
          {copy.overlay}
          <input
            id={opacityId}
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
            className="h-12 w-48"
          />
        </label>
        <button
          type="button"
          aria-pressed={mirror}
          onClick={() => setMirror((value) => !value)}
          className="press inline-flex min-h-12 items-center gap-2 rounded border border-ink px-4 text-label-md text-on-surface hover:bg-surface-container"
        >
          <FlipHorizontal aria-hidden="true" size={18} strokeWidth={1.75} />
          {copy.mirror}
        </button>
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
            className="press inline-flex min-h-12 items-center gap-2 rounded border border-ink bg-primary px-4 text-label-md text-on-primary hover:opacity-90"
          >
            <Camera aria-hidden="true" size={18} strokeWidth={1.75} />
            {copy.startCamera}
          </button>
        )}
      </div>

      {error ? (
        <p role="alert" className="rounded border border-ink bg-error-container px-4 py-3 text-body-md text-on-error-container">
          {error}
        </p>
      ) : null}

      <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded border border-ink bg-surface-container-highest">
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
            src={dress.imageUrl}
            alt={dress.title}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            style={{ opacity: opacity / 100 }}
          />
        ) : (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-body-md text-on-surface-variant">
            {copy.liveNote}
          </p>
        )}
      </div>

      <p className="text-body-sm text-on-surface-variant">
        {copy.liveNote} {dress.credit ? `${dress.title}: ${dress.credit}, ${dress.licence}.` : null}
      </p>
    </div>
  );
}
