// Project-owned line drawings (see docs/asset-credits.md). All are decorative:
// the text next to them carries the meaning, so they are hidden from
// assistive technology. Strokes use currentColor so they follow the theme.

type ArtProps = { className?: string };

const lineProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** One kawung node: four oval petals around a centre point, set on the diagonals. */
export function KawungNode({ cx, cy, size = 10 }: { cx: number; cy: number; size?: number }) {
  const rx = size * 0.34;
  const ry = size * 0.55;
  const offset = size * 0.62;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {[45, 135, 225, 315].map((angle) => (
        <ellipse key={angle} cx={0} cy={-offset} rx={rx} ry={ry} transform={`rotate(${angle})`} />
      ))}
      <circle r={size * 0.1} fill="currentColor" />
    </g>
  );
}

/** Square brand tile with a gunungan kayon portal, used beside the "Nusantara" wordmark. */
export function BrandMark({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={className}>
      <rect width="40" height="40" rx="8" className="fill-primary" />
      <g {...lineProps} className="text-on-primary" strokeWidth={1.5}>
        {/* Siluet Gunungan Kayon */}
        <path d="M20 7 C23 11 28 16 29.5 22.5 C30.5 25.5 29.5 28.5 27.5 30 C26 31 24 31 23 31 L17 31 C16 31 14 31 12.5 30 C10.5 28.5 9.5 25.5 10.5 22.5 C12 16 17 11 20 7 Z" />
        {/* Gerbang Candi Paduraksa (Cultural Portal) */}
        <path d="M17 31 V24.5 C17 22 23 22 23 24.5 V31" />
        {/* Garis Dasar Gerbang */}
        <path d="M15 33 H25" />
        {/* Sumbu Kalpataru & Cabang Pohon Hayat */}
        <line x1="20" y1="11.5" x2="20" y2="20" />
        <path d="M20 14.5 C22 13.5 24 14.5 25 16" />
        <path d="M20 14.5 C18 13.5 16 14.5 15 16" />
        <circle cx="20" cy="15.5" r="1.2" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Sketchbook plate with a kawung lattice, for the home hero. */
export function HeroArt({ className }: ArtProps) {
  const nodes: Array<[number, number]> = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      nodes.push([50 + col * 60, 40 + row * 60]);
    }
  }
  return (
    <svg viewBox="0 0 300 200" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        <rect x="8" y="8" width="284" height="184" rx="6" />
        <rect x="16" y="16" width="268" height="168" rx="3" strokeDasharray="2 5" />
        {nodes.map(([x, y]) => (
          <KawungNode key={`${x}-${y}`} cx={x} cy={y} size={16} />
        ))}
        {nodes.map(([x, y]) => (
          <g key={`link-${x}-${y}`}>
            {x < 230 ? <line x1={x + 16} y1={y} x2={x + 44} y2={y} strokeDasharray="1 4" /> : null}
            {y < 160 ? <line x1={x} y1={y + 16} x2={x} y2={y + 44} strokeDasharray="1 4" /> : null}
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Kebaya and kain on a hanger: the try-on pillar. */
export function CostumeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        <path d="M120 8 v6 M120 14 c6 0 6 8 0 8" />
        <path d="M100 26 L140 26" />
        <path d="M104 30 L120 54 L136 30" />
        <path d="M104 30 C92 32 82 38 76 48 L66 84 L80 88 L88 62" />
        <path d="M136 30 C148 32 158 38 164 48 L174 84 L160 88 L152 62" />
        <path d="M88 62 L92 96 C108 102 132 102 148 96 L152 62" />
        <circle cx="120" cy="64" r="2.5" />
        <circle cx="120" cy="75" r="2.5" />
        <circle cx="120" cy="86" r="2.5" />
        <path d="M94 100 L86 134 L154 134 L146 100" />
        <path d="M102 104 L132 134" />
      </g>
      <g {...lineProps} strokeWidth={1}>
        <KawungNode cx={100} cy={120} size={6} />
        <KawungNode cx={140} cy={116} size={6} />
        <KawungNode cx={122} cy={126} size={5} />
      </g>
    </svg>
  );
}

/** Cobek and ulekan with chilli and bay leaf: the recipe pillar. */
export function RecipeArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        <ellipse cx="110" cy="88" rx="58" ry="12" />
        <path d="M52 88 C56 114 82 124 110 124 C138 124 164 114 168 88" />
        <path d="M92 124 L88 132 L132 132 L128 124" />
        <path d="M134 84 L176 38 C180 34 188 40 184 44 L142 90" />
        <path d="M70 84 C78 80 88 80 96 84" />
        <path d="M24 74 C30 56 50 48 68 56 C54 56 38 62 24 74 Z" />
        <path d="M68 56 C71 51 76 50 80 52" />
        <path d="M184 108 C196 94 216 96 222 110 C208 118 192 116 184 108 Z" />
        <path d="M186 108 L220 109" />
      </g>
    </svg>
  );
}

/** Gunungan (kayon) with sound arcs: the folk tale and audio pillar. */
export function StoryArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 240 140" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        <path d="M110 8 C130 28 156 58 164 92 C166 104 160 114 148 118 L72 118 C60 114 54 104 56 92 C64 58 90 28 110 8 Z" />
        <path d="M76 118 L76 132 L144 132 L144 118" />
        <path d="M98 132 L98 116 Q110 106 122 116 L122 132" />
        <path d="M110 100 L110 34" />
        <path d="M110 70 C100 62 90 62 82 66 M110 70 C120 62 130 62 138 66" />
        <path d="M110 52 C102 46 94 46 88 50 M110 52 C118 46 126 46 132 50" />
        <path d="M110 86 C100 80 92 82 86 88 M110 86 C120 80 128 82 134 88" />
        <path d="M184 56 a22 22 0 0 1 0 40" />
        <path d="M196 46 a34 34 0 0 1 0 60" />
      </g>
    </svg>
  );
}

/** Wayang kulit figure in profile, on its central rod: home hero collage. */
export function WayangArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 240" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        <path d="M78 22 C70 14 72 6 82 6 C92 8 94 18 88 24" />
        <path d="M76 24 L66 30 L60 44 L70 42 L74 50 L84 46 L92 34 L88 24 Z" />
        <path d="M70 42 C66 46 64 50 66 54" />
        <path d="M74 50 L72 60 C64 64 60 76 62 90 L68 132 L96 132 L102 90 C104 76 98 64 90 60 L84 46" />
        <path d="M66 70 C52 78 42 94 40 112 L46 114 C50 98 58 86 70 80" />
        <path d="M98 72 C112 82 120 100 122 120 L116 122 C112 104 104 90 94 82" />
        <path d="M40 112 L34 132 M122 120 L130 140" />
        <path d="M68 132 L62 176 L60 196 L74 196 L80 150 L86 196 L100 196 L98 176 L96 132" />
        <path d="M64 100 L100 100 M66 112 L98 112" strokeDasharray="2 4" />
        <path d="M80 6 L80 2 M80 196 L80 238" />
      </g>
      <g {...lineProps} strokeWidth={1}>
        <KawungNode cx={80} cy={84} size={7} />
        <KawungNode cx={80} cy={160} size={6} />
      </g>
    </svg>
  );
}

/** Rumah gadang with its curved gonjong roof horns: home hero collage. */
export function RumahGadangArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 280 180" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        <path d="M14 30 C40 58 70 66 96 60 C110 56 124 48 140 44 C156 48 170 56 184 60 C210 66 240 58 266 30" />
        <path d="M40 54 C34 40 30 30 26 22 M240 54 C246 40 250 30 254 22" />
        <path d="M96 60 C100 48 104 40 108 32 M184 60 C180 48 176 40 172 32" />
        <path d="M30 60 C80 80 200 80 250 60 L240 104 L40 104 Z" />
        <path d="M40 104 L46 138 L234 138 L240 104" />
        <path d="M60 112 L60 132 M90 112 L90 132 M120 112 L120 132 M160 112 L160 132 M190 112 L190 132 M220 112 L220 132" />
        <path d="M128 138 L128 112 L152 112 L152 138" />
        <path d="M50 138 L50 168 M230 138 L230 168 M100 138 L100 168 M180 138 L180 168" />
        <path d="M118 168 L118 150 L162 150 L162 168 M8 168 L272 168" />
      </g>
      <g {...lineProps} strokeWidth={1}>
        {[70, 110, 170, 210].map((x) => (
          <KawungNode key={x} cx={x} cy={90} size={6} />
        ))}
      </g>
    </svg>
  );
}

/** A strip of batik parang: diagonal bands of linked blades. Decorative. */
export function BatikArt({ className }: ArtProps) {
  const bands = [0, 1, 2, 3, 4, 5];
  return (
    <svg viewBox="0 0 240 120" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps} strokeWidth={1.25}>
        <rect x="2" y="2" width="236" height="116" rx="4" />
        {bands.map((band) => {
          const x = band * 44 - 40;
          return (
            <g key={band}>
              <path d={`M${x} 118 L${x + 112} 2`} />
              <path d={`M${x + 22} 118 L${x + 134} 2`} strokeDasharray="1 5" />
              {[0, 1, 2, 3].map((step) => {
                const cx = x + 14 + step * 28;
                const cy = 104 - step * 29;
                return <path key={step} d={`M${cx} ${cy} c6 -10 16 -12 20 -6 c-6 2 -10 8 -12 14 c-4 -2 -6 -5 -8 -8 Z`} />;
              })}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Stupa Candi Borobudur with surrounding miniature stupas and tiered stone plinths. */
export function CandiArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 240 160" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        {/* Tiered foundation plinths */}
        <line x1="10" y1="145" x2="230" y2="145" />
        <rect x="24" y="132" width="192" height="13" rx="2" />
        <rect x="40" y="120" width="160" height="12" rx="2" />
        <rect x="56" y="110" width="128" height="10" rx="1.5" />

        {/* Left Stupa */}
        <path d="M50 110 C50 85 80 85 80 110 Z" />
        <line x1="65" y1="85" x2="65" y2="70" />
        <circle cx="65" cy="68" r="2.5" />
        <rect x="58" y="94" width="14" height="8" rx="2" strokeDasharray="2 3" strokeWidth={1} />

        {/* Right Stupa */}
        <path d="M160 110 C160 85 190 85 190 110 Z" />
        <line x1="175" y1="85" x2="175" y2="70" />
        <circle cx="175" cy="68" r="2.5" />
        <rect x="168" y="94" width="14" height="8" rx="2" strokeDasharray="2 3" strokeWidth={1} />

        {/* Central Grand Stupa */}
        <path d="M85 110 C85 50 155 50 155 110 Z" />
        <path d="M100 62 C108 45 132 45 140 62" />
        <line x1="120" y1="50" x2="120" y2="16" strokeWidth={2} />
        <line x1="114" y1="36" x2="126" y2="36" />
        <line x1="116" y1="28" x2="124" y2="28" />
        <circle cx="120" cy="14" r="3" />
      </g>
      {/* Decorative lattice holes */}
      <g {...lineProps} strokeWidth={1}>
        <path d="M105 85 L112 77 L119 85 L112 93 Z" />
        <path d="M121 85 L128 77 L135 85 L128 93 Z" />
        <path d="M113 98 L120 90 L127 98 L120 106 Z" />
      </g>
    </svg>
  );
}

/** Kapal Layar Pinisi: traditional South Sulawesi dual-masted schooner. */
export function PinisiArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 240 160" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        {/* Hull (lambung perahu kayu haluan menjulang) */}
        <path d="M25 105 C35 125 70 135 140 135 C190 135 220 120 228 92 L205 92 L185 108 L55 108 L38 92 Z" />
        <line x1="42" y1="100" x2="218" y2="100" strokeDasharray="2 4" strokeWidth={1} />

        {/* Bowsprit (anjungan cucur haluan depan) */}
        <line x1="25" y1="105" x2="5" y2="82" strokeWidth={2} />
        <line x1="5" y1="82" x2="65" y2="88" strokeDasharray="2 3" strokeWidth={1} />
        <line x1="5" y1="82" x2="95" y2="30" strokeDasharray="2 4" strokeWidth={1} />

        {/* Main mast 1 (Tiang Agung Depan) */}
        <line x1="95" y1="108" x2="90" y2="24" strokeWidth={2} />
        {/* Main mast 2 (Tiang Agung Belakang) */}
        <line x1="150" y1="108" x2="148" y2="34" strokeWidth={2} />

        {/* Sails 1 (Layar Depan) */}
        <path d="M88 28 C105 45 108 65 92 78 Z" />
        <path d="M86 52 C72 65 68 80 84 88 Z" />
        <path d="M92 42 C115 58 118 78 94 92 Z" />

        {/* Sails 2 (Layar Belakang) */}
        <path d="M146 38 C165 52 168 72 150 82 Z" />
        <path d="M148 58 C172 72 174 92 152 100 Z" />

        {/* Rudder and cabin */}
        <rect x="175" y="96" width="22" height="10" rx="1.5" />
        <line x1="210" y1="110" x2="215" y2="135" strokeWidth={2} />

        {/* Ocean Waves */}
        <path d="M8 142 C20 138 35 144 50 141 C65 138 80 144 95 141 C110 138 125 144 140 141 C155 138 170 144 185 141 C200 138 215 144 232 140" strokeWidth={1.25} />
        <path d="M18 148 C32 145 45 150 60 147 C75 144 90 150 105 147 C120 144 135 150 150 147 C165 144 180 150 200 146" strokeDasharray="2 4" strokeWidth={1} />
      </g>
    </svg>
  );
}

/** Keris Pusaka: traditional Indonesian wavy-bladed dagger with pamor pattern and ukir hilt. */
export function KerisArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 240" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        {/* Hulu / Gagang Keris (Deder Ukiran Kayu) */}
        <path d="M72 18 C70 24 74 34 82 38 C90 42 92 50 86 58 L76 64 C73 66 74 72 80 72 L86 72" />
        <path d="M78 22 C84 20 90 26 88 34" />
        <circle cx="82" cy="30" r="1.5" fill="currentColor" />

        {/* Mendak & Selut (Cincin Penghias Antara Hulu & Gandik) */}
        <ellipse cx="80" cy="74" rx="8" ry="3" />
        <line x1="72" y1="77" x2="88" y2="77" />

        {/* Gonjo (Alas Dasar Bilah Keris) */}
        <path d="M58 84 C68 80 92 80 102 84 C96 87 64 87 58 84 Z" />
        <path d="M102 84 C106 82 110 84 108 88 C104 90 98 87 96 85" />
        <circle cx="65" cy="83" r="1.5" />

        {/* Bilah Berluk (Luk 5 Bertatah Pamor) */}
        {/* Tepi Kiri Bilah */}
        <path d="M74 84 C72 96 88 108 84 122 C80 136 66 148 72 164 C78 180 88 194 82 208 C78 218 79 226 80 232" />
        {/* Tepi Kanan Bilah */}
        <path d="M86 84 C84 96 100 108 96 122 C92 136 78 148 84 164 C90 180 100 194 94 208 C90 218 83 226 80 232" />
        {/* Tulang Tengah / Ada-Ada */}
        <path d="M80 84 C78 96 94 108 90 122 C86 136 72 148 78 164 C84 180 94 194 88 208 C84 218 81 226 80 232" strokeWidth={1} strokeDasharray="3 3" />

        {/* Garis Pamor (Beras Wutah / Udan Mas) */}
        <path d="M77 100 C81 103 85 102 89 104" strokeWidth={0.8} />
        <path d="M79 116 C83 118 87 117 91 120" strokeWidth={0.8} />
        <path d="M72 142 C76 145 80 144 84 146" strokeWidth={0.8} />
        <path d="M76 158 C80 160 84 159 88 162" strokeWidth={0.8} />
        <path d="M78 186 C82 188 86 187 90 190" strokeWidth={0.8} />
      </g>
      <g {...lineProps} strokeWidth={1}>
        <KawungNode cx={80} cy={138} size={5} />
        <KawungNode cx={80} cy={176} size={5} />
      </g>
    </svg>
  );
}

/** Angklung: traditional Sundanese tuned bamboo idiophone instrument. */
export function AngklungArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false" className={`line-art ${className ?? ""}`}>
      <g {...lineProps}>
        {/* Rangka Bambu Luar (Outer Standing Bamboo Frame) */}
        <line x1="40" y1="20" x2="40" y2="185" strokeWidth={2} />
        <line x1="160" y1="20" x2="160" y2="185" strokeWidth={2} />
        <line x1="30" y1="35" x2="170" y2="35" strokeWidth={2} />
        <line x1="30" y1="165" x2="170" y2="165" strokeWidth={2.5} />

        {/* Tabung Dasar Resonansi Bawah (Horizontal Base Tubes with Slits) */}
        <rect x="52" y="155" width="42" height="18" rx="3" />
        <rect x="106" y="155" width="42" height="18" rx="3" />
        <line x1="60" y1="164" x2="86" y2="164" strokeDasharray="2 3" />
        <line x1="114" y1="164" x2="140" y2="164" strokeDasharray="2 3" />

        {/* Tiang Penyangga Tengah */}
        <line x1="100" y1="35" x2="100" y2="165" strokeWidth={1.5} />

        {/* Tabung Bambu 1 (Nada Rendah / Panjang - Kiri) */}
        <rect x="62" y="55" width="22" height="100" rx="3" />
        <path d="M62 55 L73 40 L84 55 Z" />
        <line x1="73" y1="65" x2="73" y2="145" strokeDasharray="3 4" strokeWidth={1} />

        {/* Tabung Bambu 2 (Nada Tinggi / Lebih Pendek - Kanan) */}
        <rect x="116" y="80" width="22" height="75" rx="3" />
        <path d="M116 80 L127 68 L138 80 Z" />
        <line x1="127" y1="90" x2="127" y2="145" strokeDasharray="3 4" strokeWidth={1} />

        {/* Palang Penahan Suara Bambu */}
        <line x1="50" y1="110" x2="150" y2="110" strokeWidth={1.5} />
        {/* Tali Pengikat Rotan Tradisional */}
        <circle cx="40" cy="35" r="3" />
        <circle cx="160" cy="35" r="3" />
        <circle cx="100" cy="35" r="3" />
        <circle cx="40" cy="165" r="3" />
        <circle cx="160" cy="165" r="3" />
        <circle cx="100" cy="165" r="3" />
      </g>
    </svg>
  );
}

