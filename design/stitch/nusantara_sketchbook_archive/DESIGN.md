---
name: Nusantara Sketchbook & Archive
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#43474e'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f86'
  primary: '#032448'
  on-primary: '#ffffff'
  primary-container: '#1f3a5f'
  on-primary-container: '#8ba4cf'
  inverse-primary: '#aec8f4'
  secondary: '#835425'
  on-secondary: '#ffffff'
  secondary-container: '#febf87'
  on-secondary-container: '#794c1e'
  tertiary: '#755b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea72c'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#aec8f4'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d476d'
  secondary-fixed: '#ffdcc0'
  secondary-fixed-dim: '#f8ba82'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#673d10'
  tertiary-fixed: '#ffe08e'
  tertiary-fixed-dim: '#ecc246'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-xl:
    fontFamily: Merriweather
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: 3.125rem
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Merriweather
    fontSize: 1.875rem
    fontWeight: '700'
    lineHeight: 2.375rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Merriweather
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.625rem
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Merriweather
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: '0'
  headline-md:
    fontFamily: Merriweather
    fontSize: 1.375rem
    fontWeight: '700'
    lineHeight: 1.875rem
  story-body:
    fontFamily: Merriweather
    fontSize: 1.125rem
    fontWeight: '300'
    lineHeight: 1.9125rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an authentic, warm, and archival digital experience designed to showcase Indonesian folklore, culinary heritage, and traditional attire. It bridges the tactile, physical qualities of a naturalist's field sketchbook with the fluid ergonomics of modern Indonesian digital products.

### Visual Aesthetic
The aesthetic balances editorial literary dignity with warm archival craftsmanship:
- **Atmosphere:** Natural, contemplative, tactile, and educational. It avoids gamification, loud commercial tropes, and synthetic gloss.
- **Graphic Character:** Pen-and-ink contours, crisp framing, and structural balance reminiscent of hand-drawn field logs, archival botanical studies, and traditional lithographs.
- **Cultural Motifs:** Integrated as deliberate linework and structural accents—including quiet vector representations of *batik kawung*, silhouette outlines of *rumah gadang* gables, *candi* stone reliefs, and *phinisi* rigging—used as border ornaments or section breaks rather than floating decorative clutter.

### Target Audience & Voice
- **Audience:** Cultural researchers, domestic and international diaspora readers, heritage travelers, and educators seeking accessible, deep cultural narratives in both Indonesian (*Bahasa Indonesia*) and English.
- **Tone:** Respectful, grounded, scholarly yet warm, accessible, and inviting.

## Colors

The palette draws directly from classic Indonesian artisan pigments: natural tree saps, river muds, indigo baths, and sun-dried bamboo parchment.

### Palette Architecture
- **Primary (`#1F3A5F` - Batik Indigo):** A deep maritime indigo inspired by traditional coastal and court batik dyes. Anchors primary interactive controls, active navigation states, key icons, and prominent headers.
- **Secondary (`#8A5A2B` - Saga Brown):** A warm terracotta-tinted bark brown reminiscent of dried *soga* dye. Used for category chips, secondary actions, section delimiters, and cultural taxonomy tags.
- **Tertiary (`#C9A227` - Gold Accent):** Used sparingly as an illumination accent—honorific badges, active metadata star markers, and delicate linework dividers. Never used for large surface fills or critical body text.
- **Neutral Dark (`#2B2B2B` - Ink Dark):** Carbon-black fountain pen ink. Used for high-contrast primary typography and precise 1px UI borders on paper backgrounds.
- **Paper Light (`#F7F1E3`):** The default background canvas. Mimics uncoated, fibrous off-white sketchbook paper, reducing eye fatigue during sustained reading.

### Dark Mode Architecture
- **Canvas Base:** `#18191C` (Deep Night Charcoal).
- **Surface Elevation:** `#23272E` and `#282A2E` for modular card containers.
- **Structural Outlines:** `#3E4249` for crisp 1px borders.
- **Typography:** `#EDE6D8` (Parchment Ink) for high-contrast reading, accompanied by `#A39E93` for supplementary metadata.

All color combinations satisfy WCAG AA contrast standards (minimum 4.5:1 for body copy and 3:1 for large graphical components and controls).

## Typography

The typographic pairing reinforces dual needs: narrative intimacy for oral and written traditions, and clear legibility for bilingual utility.

### Type Roles
- **Editorial Headings & Folklore (`Merriweather`):** Selected for warm slab serifs, sturdy proportions, and literary cadence. It commands reverence in article headers and delivers an immersive, book-like reading cadence across long-form folklore prose (`story-body` features an expanded 1.7 line-height ratio).
- **Interface & Taxonomy (`Plus Jakarta Sans`):** Developed with humanist geometric clarity, this typeface provides modern Indonesian digital ergonomics. It delivers effortless legibility for metadata badges, ingredient lists, navigation bars, and bilingual toggles.

### Bilingual Typesetting Rules
- Indonesian and English copy lengths often differ by up to 20%. Interface buttons, chips, and metadata cards must permit vertical label wrapping rather than truncating with ellipses.
- Headings maintain fixed line-height ratios to accommodate diacritics and ascenders gracefully.

## Layout & Spacing

The layout is built around mobile-first utility, scaling up to structured editorial broadsheets on desktop viewports.

### Grid & Responsive Rules
- **Mobile (Base < 768px):** 4-column fluid layout with `1rem` margins and `1rem` gutters. Content runs edge-to-margin to preserve reading rhythm on compact screens.
- **Tablet (768px - 1024px):** 8-column layout with `2rem` margins and `1.5rem` gutters. Secondary cultural sidebars (glossaries, map pins) dock beside main reading streams.
- **Desktop (> 1024px):** 12-column layout capped at an optimal reading container max-width of `1200px` (`720px` for pure folklore reading columns), centered with `3rem` margins.

### Spacing Principles
- Spacing follows an 8-point rhythmic scale with 4-point micro-adjustments.
- Component groupings utilize `space-md` for standard internal spacing, while story paragraphs utilize `space-lg` to simulate book typesetting margins.

## Elevation & Depth

To honor the physical sketchbook medium, this design system rejects blurry drop shadows and plastic ambient blurs in favor of graphic edge definition and layered paper surfaces.

### Elevation Levels
- **Level 0 (Parchment Foundation):** The base canvas (`#F7F1E3` in light mode, `#18191C` in dark mode). Flat, tactile, un-shadowed.
- **Level 1 (Card & Module Layer):** Uses a solid 1px ink border (`#2B2B2B` at 20% opacity on light mode; `#3E4249` at 100% on dark mode) paired with a crisp, hard-edged shadow offset: `1px 2px 0px rgba(43, 43, 43, 0.08)`. This reproduces the physical weight of stacked craft cards.
- **Level 2 (Interactive Floating Elements & Drawers):** Modals, bottom sheets, and language selectors elevate with a distinct ink border and an assertive, structured shadow offset: `3px 4px 0px rgba(43, 43, 43, 0.15)`.

### Hand-Drawn Edge Accents
- Subtle 1px dotted or dashed internal lines (colored with Batik Indigo or Saga Brown at low opacity) serve as horizontal separators between narrative sections, evoking notebook binding and stitch lines.

## Shapes

The shape hierarchy establishes disciplined, grounded forms that feel cut from stiff paper or bookbinding cardstock.

### Corner Curvature Rules
- **Level 2 (Rounded - 0.5rem / 8px):** Standard curvature for cards, interactive buttons, modal frames, and form inputs. It softens digital interfaces without degrading the hand-drawn sketchbook structure.
- **Tags & Badges (0.25rem / 4px):** Micro labels and taxonomy pills retain tighter corners to mimic cut parchment tape or library catalog slips.
- **Motif Stamp Containers:** Square containers housing wayang or architectural line art feature crisp 8px radii paired with a 1px solid ink contour.

## Components

Every component adheres to accessible, mobile-first guidelines with minimum 48px touch targets and hand-drawn ink framing.

### Buttons
- **Primary Button:** Filled with Batik Indigo (`#1F3A5F`), white text (`#FFFFFF`), 8px border radius, 48px minimum height. Border: 1px solid `#1F3A5F`. Subtle hover/press: shifts down-right by 1px with hard drop-shadow collapse to evoke physical stamping.
- **Secondary Button:** Outlined button with 1.5px solid Saga Brown (`#8A5A2B`) or Ink Dark (`#2B2B2B`), transparent background, ink text.
- **Icon / Utility Buttons:** Padded to 48px x 48px bounding boxes; icon linework strictly 1.5px to 2px stroke matching standard pen tips.

### Cards & Story Snippets
- Built on a crisp, paper-tinted surface with an 8px border radius and a 1px contour outline.
- **Folklore Card:** Features an authentic ink-sketch illustration top plate, followed by a category chip (`Saga Brown`), an editorial `Merriweather` heading, a snippet of bilingual text, and estimated reading time.
- Avoids glossy image overlays; thumbnails use high-contrast cultural sketches or authentic photographs with warm color grading.

### Chips & Badges
- Compact 32px height container, 4px border radius.
- Categorical chips (e.g., *Sumatra*, *Jawa*, *Kuliner Tradisional*) utilize light tint fills of Saga Brown or Batik Indigo with crisp 1px borders and bold `label-sm` text.

### Form Inputs & Bilingual Selectors
- **Input Fields:** 48px height, 8px border radius, 1px solid pen ink outline (`#2B2B2B` at 30% rest; `#1F3A5F` active focus). Placeholder text sits in muted ink with minimum WCAG AA contrast.
- **Bilingual Language Switcher (`ID` | `EN`):** Segmented pill component styled like a paper index tab. The active language is anchored in Batik Indigo with parchment white typography.

### Checkboxes & Radios
- Square (checkbox) and circular (radio) touch zones of 48px enclosing a visible 20px x 20px ink boundary. Checked states employ a crisp pen-drawn tick or solid center ink pip rather than synthetic gradients.

### Cultural Vignettes & Dividers
- Section dividers incorporate subtle, static geometric motifs—such as a single central *kawung* node or triple-diamond diamond stamp—rendered in 1px linework with Saga Brown or Gold accents.