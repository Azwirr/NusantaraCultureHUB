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

/** Square brand tile with a kawung node, used beside the "Nusantara" wordmark. */
export function BrandMark({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={className}>
      <rect width="40" height="40" rx="8" className="fill-primary" />
      <g {...lineProps} className="text-on-primary" strokeWidth={1.75}>
        <KawungNode cx={20} cy={20} size={11} />
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
