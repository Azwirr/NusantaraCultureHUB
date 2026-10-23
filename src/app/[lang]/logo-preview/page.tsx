import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";

/** Logo Gunungan Kayon Minimalis (Cultural Portal) */
export function GununganMark({
  size = 40,
  className = "",
  showTile = true,
}: {
  size?: number;
  className?: string;
  showTile?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {showTile && <rect width="40" height="40" rx="8" className="fill-primary" />}
      
      {/* Siluet Luar Gunungan Kayon */}
      <path
        d="M20 6.5
           C23.2 10.5 28.5 16 30.8 22.5
           C32.4 26.2 31.6 29.8 29.2 31.4
           C27.6 32.2 25.2 32.2 24.5 32.2
           L15.5 32.2
           C14.8 32.2 12.4 32.2 10.8 31.4
           C8.4 29.8 7.6 26.2 9.2 22.5
           C11.5 16 16.8 10.5 20 6.5 Z"
        fill="none"
        stroke={showTile ? "var(--on-primary, #ffffff)" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Garis Aksen Emas Dalam */}
      <path
        d="M20 9.8
           C22.4 13 26.5 17.8 28.2 23
           C29 25.8 27.8 28.2 25.8 29.4"
        fill="none"
        stroke="#c9a227"
        strokeWidth="1"
        strokeDasharray="1.5 2"
        strokeLinecap="round"
      />
      <path
        d="M20 9.8
           C17.6 13 13.5 17.8 11.8 23
           C11 25.8 12.2 28.2 14.2 29.4"
        fill="none"
        stroke="#c9a227"
        strokeWidth="1"
        strokeDasharray="1.5 2"
        strokeLinecap="round"
      />

      {/* Gerbang Candi Paduraksa (Cultural Portal) */}
      <path
        d="M16.8 32.2 V25 C16.8 22 23.2 22 23.2 25 V32.2"
        fill="none"
        stroke={showTile ? "var(--on-primary, #ffffff)" : "currentColor"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sumbu Pusaka Keemasan */}
      <line x1="20" y1="12" x2="20" y2="20.5" stroke="#c9a227" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="20" cy="16.5" r="1.3" fill="#c9a227" />
    </svg>
  );
}

export default function LogoPreviewPage() {
  return (
    <div className="page-container py-10">
      <div className="mb-6">
        <ButtonLink href="/" variant="secondary">
          <ArrowLeft size={16} strokeWidth={1.75} />
          Kembali ke Beranda
        </ButtonLink>
      </div>

      <header className="mb-10 flex flex-col gap-2">
        <p className="text-label-sm uppercase text-secondary">Identitas Visual Kuratorial</p>
        <h1 className="font-serif text-headline-xl text-on-surface">Preview Logo: Gunungan Cultural Portal</h1>
        <p className="max-w-prose text-body-lg text-on-surface-variant">
          Eksplorasi lambang Gunungan Kayon dengan gerbang candi Paduraksa dan sumbu pusaka keemasan untuk Nusantara Pusaka Budaya.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Card 1: Large Showcase Mode Terang */}
        <Card className="flex flex-col items-center justify-center gap-6 p-8 text-center bg-surface-container-low">
          <p className="text-label-sm uppercase text-secondary">Tampilan Utama (Mode Siang)</p>
          <div className="flex size-36 items-center justify-center rounded-2xl bg-surface-container-lowest p-4 shadow-2 border border-ink">
            <GununganMark size={110} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-serif text-2xl font-bold text-primary tracking-wide">Nusantara</span>
            <span className="text-xs uppercase tracking-widest text-secondary font-medium">Pusaka Budaya</span>
          </div>
          <p className="text-body-sm text-on-surface-variant max-w-xs">
            Paduan tile Batik Indigo (#1F3A5F) dengan siluet Gunungan putih perkamen dan sumbu emas (#C9A227).
          </p>
        </Card>

        {/* Card 2: Large Showcase Mode Malam */}
        <Card className="flex flex-col items-center justify-center gap-6 p-8 text-center bg-[#18191c] text-[#ede6d8] border-[#3e4249]">
          <p className="text-label-sm uppercase text-[#e3b48a]">Tampilan Mode Malam (Dark Canvas)</p>
          <div className="flex size-36 items-center justify-center rounded-2xl bg-[#202328] p-4 shadow-2 border border-[#3e4249]">
            <GununganMark size={110} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-serif text-2xl font-bold text-[#aec8f4] tracking-wide">Nusantara</span>
            <span className="text-xs uppercase tracking-widest text-[#e3b48a] font-medium">Pusaka Budaya</span>
          </div>
          <p className="text-body-sm text-[#a39e93] max-w-xs">
            Warna bersinar anggun di atas kanvas gelap khas kain batik malam.
          </p>
        </Card>
      </div>

      {/* Bagian Uji Ukuran Responsif */}
      <section className="mt-12">
        <h2 className="font-serif text-headline-md text-on-surface mb-4">Uji Ketajaman di Berbagai Ukuran</h2>
        <Card className="p-6">
          <div className="flex flex-wrap items-end gap-10">
            <div className="flex flex-col items-center gap-2">
              <GununganMark size={64} />
              <span className="text-xs text-on-surface-variant">64px (App Icon)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <GununganMark size={40} />
              <span className="text-xs text-on-surface-variant">40px (Header Navbar)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <GununganMark size={32} />
              <span className="text-xs text-on-surface-variant">32px (Favicon L)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <GununganMark size={24} />
              <span className="text-xs text-on-surface-variant">24px (Small Chip)</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Simulasi Tampilan Header */}
      <section className="mt-12">
        <h2 className="font-serif text-headline-md text-on-surface mb-4">Simulasi Header Sebenarnya</h2>
        <div className="rounded border border-ink bg-surface p-4 shadow-1">
          <div className="flex items-center gap-3">
            <GununganMark size={40} />
            <div className="flex flex-col">
              <span className="font-serif text-wordmark text-primary">Nusantara</span>
              <span className="text-label-sm text-secondary">Pusaka Budaya</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
