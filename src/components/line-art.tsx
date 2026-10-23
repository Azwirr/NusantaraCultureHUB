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
