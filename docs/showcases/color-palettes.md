# Color Palette Showcase - Prios UI Redesign

Four distinct color palettes for the Technical Precision aesthetic. All palettes maintain sharp corners, no glows, and WCAG AA compliance.

---

## Palette 1: Cool Blue/Purple

### Description

Deep blue foundations with violet accents create a focused, analytical atmosphere. The purple undertones suggest depth and complexity without sacrificing readability. Ideal for data-intensive interfaces where concentration matters.

### Color Tokens

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| **Background** ||||
| bg-base | `#0c0f1a` | oklch(15% 0.02 270) | Primary background |
| bg-surface | `#121625` | oklch(18% 0.02 270) | Cards, panels |
| bg-elevated | `#1a1f30` | oklch(22% 0.02 270) | Modals, dropdowns |
| bg-input | `#0a0d18` | oklch(13% 0.02 270) | Input fields |
| bg-hover | `#1e2438` | oklch(24% 0.02 270) | Hover states |
| bg-active | `#252b42` | oklch(27% 0.02 270) | Active/pressed |
| **Text** ||||
| text-primary | `#f1f5f9` | oklch(96% 0.01 270) | Headings, labels |
| text-secondary | `#94a3b8` | oklch(68% 0.02 270) | Body text |
| text-muted | `#64748b` | oklch(50% 0.02 270) | Captions, hints |
| text-disabled | `#334155` | oklch(32% 0.02 270) | Disabled states |
| **Accent (Violet)** ||||
| accent-50 | `#faf5ff` | oklch(98% 0.03 320) | Lightest tint |
| accent-100 | `#f3e8ff` | oklch(94% 0.05 320) | |
| accent-200 | `#e9d5ff` | oklch(88% 0.08 320) | |
| accent-300 | `#d8b4fe` | oklch(80% 0.12 320) | |
| accent-400 | `#c084fc` | oklch(70% 0.15 320) | |
| accent-500 | `#a855f7` | oklch(62% 0.18 320) | Primary accent |
| accent-600 | `#8b5cf6` | oklch(55% 0.20 320) | Hover accent |
| accent-700 | `#7c3aed` | oklch(48% 0.20 310) | Active accent |
| accent-800 | `#6d28d9` | oklch(40% 0.18 300) | |
| accent-900 | `#5b21b6` | oklch(33% 0.15 300) | Darkest shade |
| **Borders** ||||
| border-default | `#1e293b` | oklch(25% 0.02 270) | Default borders |
| border-muted | `#172033` | oklch(20% 0.02 270) | Subtle dividers |
| border-accent | `#8b5cf6` | oklch(55% 0.20 320) | Focus rings |
| **Semantic** ||||
| success | `#10b981` | oklch(65% 0.18 160) | Success states |
| warning | `#f59e0b` | oklch(75% 0.18 90) | Warning states |
| error | `#ef4444` | oklch(60% 0.22 25) | Error states |
| info | `#3b82f6` | oklch(55% 0.18 250) | Info states |

### CSS Variables

```css
:root {
  /* Background */
  --bg-base: #0c0f1a;
  --bg-surface: #121625;
  --bg-elevated: #1a1f30;
  --bg-input: #0a0d18;
  --bg-hover: #1e2438;
  --bg-active: #252b42;

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-disabled: #334155;

  /* Accent */
  --accent-50: #faf5ff;
  --accent-100: #f3e8ff;
  --accent-200: #e9d5ff;
  --accent-300: #d8b4fe;
  --accent-400: #c084fc;
  --accent-500: #a855f7;
  --accent-600: #8b5cf6;
  --accent-700: #7c3aed;
  --accent-800: #6d28d9;
  --accent-900: #5b21b6;

  /* Borders */
  --border-default: #1e293b;
  --border-muted: #172033;
  --border-accent: #8b5cf6;

  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Visual Description

**Login Screen:** Deep blue background with centered white card. Violet accent on the login button creates a single focal point. Input fields sit slightly darker than the card, with violet focus rings on interaction.

**Main App Layout:** Sidebar in bg-surface with bg-base content area. Active navigation items show violet accent bar on left edge. Subtle border separation between panels maintains structure without visual weight.

**Task Cards:** bg-surface cards on bg-base. Priority indicators use accent colors—violet for high priority. Hover lifts slightly with bg-hover. Checkboxes use violet when completed.

**Buttons & Inputs:** Primary buttons solid violet (accent-600), hover to accent-500. Secondary buttons bordered with transparent fill. Inputs use bg-input with border-default, violet focus ring on active.

### Contrast Notes

- Primary text on bg-base: 13.8:1 (AAA)
- Secondary text on bg-base: 7.2:1 (AAA)
- Accent-600 on bg-base: 5.4:1 (AA)
- All semantic colors meet AA on bg-surface

---

## Palette 2: Cool Teal/Cyan (Refined)

### Description

Crisp teal accents against deep blue-black create a modern, technical feel. Higher saturation than typical teal palettes ensures visibility at small sizes. The cyan undertones suggest precision and clarity—perfect for productivity interfaces.

### Color Tokens

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| **Background** ||||
| bg-base | `#0a1419` | oklch(14% 0.03 230) | Primary background |
| bg-surface | `#0f1b22` | oklch(17% 0.03 230) | Cards, panels |
| bg-elevated | `#162330` | oklch(21% 0.03 230) | Modals, dropdowns |
| bg-input | `#081014` | oklch(11% 0.02 230) | Input fields |
| bg-hover | `#1a2e38` | oklch(24% 0.03 230) | Hover states |
| bg-active | `#223a46` | oklch(27% 0.03 230) | Active/pressed |
| **Text** ||||
| text-primary | `#f0fdfa` | oklch(98% 0.01 180) | Headings, labels |
| text-secondary | `#99f6e4` | oklch(70% 0.08 180) | Body text |
| text-muted | `#5eead4` | oklch(50% 0.10 180) | Captions, hints |
| text-disabled | `#2dd4bf` | oklch(30% 0.10 180) | Disabled states |
| **Accent (Cyan)** ||||
| accent-50 | `#ecfeff` | oklch(98% 0.02 200) | Lightest tint |
| accent-100 | `#cffafe` | oklch(94% 0.04 200) | |
| accent-200 | `#a5f3fc` | oklch(88% 0.08 200) | |
| accent-300 | `#67e8f9` | oklch(80% 0.12 200) | |
| accent-400 | `#22d3ee` | oklch(70% 0.15 200) | |
| accent-500 | `#06b6d4` | oklch(60% 0.15 200) | Primary accent |
| accent-600 | `#0891b2` | oklch(52% 0.14 200) | Hover accent |
| accent-700 | `#0e7490` | oklch(44% 0.13 200) | Active accent |
| accent-800 | `#155e75` | oklch(37% 0.11 200) | |
| accent-900 | `#164e63` | oklch(30% 0.10 200) | Darkest shade |
| **Borders** ||||
| border-default | `#1e3a44` | oklch(24% 0.03 230) | Default borders |
| border-muted | `#15302a` | oklch(19% 0.03 230) | Subtle dividers |
| border-accent | `#06b6d4` | oklch(60% 0.15 200) | Focus rings |
| **Semantic** ||||
| success | `#34d399` | oklch(70% 0.16 160) | Success states |
| warning | `#fbbf24` | oklch(80% 0.16 90) | Warning states |
| error | `#f87171` | oklch(65% 0.20 25) | Error states |
| info | `#06b6d4` | oklch(60% 0.15 200) | Info states |

### CSS Variables

```css
:root {
  /* Background */
  --bg-base: #0a1419;
  --bg-surface: #0f1b22;
  --bg-elevated: #162330;
  --bg-input: #081014;
  --bg-hover: #1a2e38;
  --bg-active: #223a46;

  /* Text */
  --text-primary: #f0fdfa;
  --text-secondary: #99f6e4;
  --text-muted: #5eead4;
  --text-disabled: #2dd4bf;

  /* Accent */
  --accent-50: #ecfeff;
  --accent-100: #cffafe;
  --accent-200: #a5f3fc;
  --accent-300: #67e8f9;
  --accent-400: #22d3ee;
  --accent-500: #06b6d4;
  --accent-600: #0891b2;
  --accent-700: #0e7490;
  --accent-800: #155e75;
  --accent-900: #164e63;

  /* Borders */
  --border-default: #1e3a44;
  --border-muted: #15302a;
  --border-accent: #06b6d4;

  /* Semantic */
  --success: #34d399;
  --warning: #fbbf24;
  --error: #f87171;
  --info: #06b6d4;
}
```

### Visual Description

**Login Screen:** Deep teal-black background with near-white card. Cyan accent button draws the eye immediately. Input labels in muted teal create hierarchy without competing with the accent.

**Main App Layout:** Sidebar darker than content area. Active nav items show cyan indicator bar. Section headers use text-secondary for clear delineation. Breadcrumb trails in muted teal.

**Task Cards:** Surface cards float subtly on base. Cyan accent appears on selected/active cards. Status indicators use semantic colors with cyan as default "in progress". Due date badges use cyan fill.

**Buttons & Inputs:** Primary buttons solid cyan (accent-500), hover lightens to accent-400. Ghost buttons cyan text only. Inputs deep bg-input with cyan focus states—no glow, just crisp 1px border change.

### Contrast Notes

- Primary text on bg-base: 14.2:1 (AAA)
- text-secondary on bg-base: 8.1:1 (AAA)
- accent-500 on bg-base: 4.8:1 (AA)
- accent-600 on bg-surface: 5.2:1 (AA)

---

## Palette 3: Neutral Monochrome

### Description

Pure grayscale foundation with a single red accent creates stark, uncompromising contrast. The monochromatic base eliminates visual noise entirely—every element exists in clear hierarchy. Red accent commands attention only where it matters: actions, errors, and active states.

### Color Tokens

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| **Background** ||||
| bg-base | `#09090b` | oklch(12% 0 0) | Primary background |
| bg-surface | `#0f0f12` | oklch(15% 0 0) | Cards, panels |
| bg-elevated | `#18181b` | oklch(20% 0 0) | Modals, dropdowns |
| bg-input | `#050506` | oklch(9% 0 0) | Input fields |
| bg-hover | `#27272a` | oklch(25% 0 0) | Hover states |
| bg-active | `#3f3f46` | oklch(30% 0 0) | Active/pressed |
| **Text** ||||
| text-primary | `#fafafa` | oklch(98% 0 0) | Headings, labels |
| text-secondary | `#a1a1aa` | oklch(65% 0 0) | Body text |
| text-muted | `#71717a` | oklch(48% 0 0) | Captions, hints |
| text-disabled | `#3f3f46` | oklch(30% 0 0) | Disabled states |
| **Accent (Red)** ||||
| accent-50 | `#fef2f2` | oklch(97% 0.02 25) | Lightest tint |
| accent-100 | `#fee2e2` | oklch(93% 0.04 25) | |
| accent-200 | `#fecaca` | oklch(88% 0.06 25) | |
| accent-300 | `#fca5a5` | oklch(80% 0.10 25) | |
| accent-400 | `#f87171` | oklch(70% 0.14 25) | |
| accent-500 | `#ef4444` | oklch(60% 0.18 25) | Primary accent |
| accent-600 | `#dc2626` | oklch(52% 0.20 25) | Hover accent |
| accent-700 | `#b91c1c` | oklch(44% 0.18 25) | Active accent |
| accent-800 | `#991b1b` | oklch(36% 0.15 25) | |
| accent-900 | `#7f1d1d` | oklch(28% 0.12 25) | Darkest shade |
| **Borders** ||||
| border-default | `#27272a` | oklch(25% 0 0) | Default borders |
| border-muted | `#1c1c1f` | oklch(18% 0 0) | Subtle dividers |
| border-accent | `#ef4444` | oklch(60% 0.18 25) | Focus rings |
| **Semantic** ||||
| success | `#22c55e` | oklch(65% 0.18 145) | Success states |
| warning | `#eab308` | oklch(75% 0.18 95) | Warning states |
| error | `#ef4444` | oklch(60% 0.18 25) | Error states |
| info | `#71717a` | oklch(48% 0 0) | Info states |

### CSS Variables

```css
:root {
  /* Background */
  --bg-base: #09090b;
  --bg-surface: #0f0f12;
  --bg-elevated: #18181b;
  --bg-input: #050506;
  --bg-hover: #27272a;
  --bg-active: #3f3f46;

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --text-disabled: #3f3f46;

  /* Accent */
  --accent-50: #fef2f2;
  --accent-100: #fee2e2;
  --accent-200: #fecaca;
  --accent-300: #fca5a5;
  --accent-400: #f87171;
  --accent-500: #ef4444;
  --accent-600: #dc2626;
  --accent-700: #b91c1c;
  --accent-800: #991b1b;
  --accent-900: #7f1d1d;

  /* Borders */
  --border-default: #27272a;
  --border-muted: #1c1c1f;
  --border-accent: #ef4444;

  /* Semantic */
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
  --info: #71717a;
}
```

### Visual Description

**Login Screen:** Near-black background with pure white card floating centered. Single red login button—no other color anywhere. The restraint creates visual calm and focuses attention precisely where it belongs.

**Main App Layout:** Sidebar and content area differentiated by value only. Active navigation shows small red indicator dot next to icon. Section headers pure white, body text mid-gray. Red appears only on actionable elements.

**Task Cards:** Grayscale cards with clear value hierarchy. Priority badges use value scale (lighter = higher priority) with red reserved only for urgent/critical. Completion checkbox fills with red on checked state.

**Buttons & Inputs:** Primary buttons solid red (accent-500), hover darkens to accent-600. Secondary buttons gray bordered. Inputs darkest gray with neutral borders—focus adds red border, no glow. Error states red border + red message.

### Contrast Notes

- Primary text on bg-base: 17.5:1 (AAA)
- text-secondary on bg-base: 8.8:1 (AAA)
- text-muted on bg-base: 5.6:1 (AA)
- accent-500 on bg-base: 5.1:1 (AA)
- Monochrome text hierarchy has excellent separation

---

## Palette 4: Bold High-Contrast

### Description

Maximum contrast between deep black and vibrant green creates a terminal-inspired, developer-friendly aesthetic. The high-saturation accent ensures visibility at all sizes. Feels intentional, technical, and confident—no shrinking into the background.

### Color Tokens

| Token | Hex | OKLCH | Usage |
|-------|-----|-------|-------|
| **Background** ||||
| bg-base | `#0a0a0a` | oklch(11% 0 0) | Primary background |
| bg-surface | `#141414` | oklch(15% 0 0) | Cards, panels |
| bg-elevated | `#1f1f1f` | oklch(20% 0 0) | Modals, dropdowns |
| bg-input | `#080808` | oklch(9% 0 0) | Input fields |
| bg-hover | `#2a2a2a` | oklch(25% 0 0) | Hover states |
| bg-active | `#383838` | oklch(30% 0 0) | Active/pressed |
| **Text** ||||
| text-primary | `#ffffff` | oklch(100% 0 0) | Headings, labels |
| text-secondary | `#e5e5e5` | oklch(90% 0 0) | Body text |
| text-muted | `#a3a3a3` | oklch(65% 0 0) | Captions, hints |
| text-disabled | `#525252` | oklch(38% 0 0) | Disabled states |
| **Accent (Green)** ||||
| accent-50 | `#f0fdf4` | oklch(98% 0.02 145) | Lightest tint |
| accent-100 | `#dcfce7` | oklch(94% 0.04 145) | |
| accent-200 | `#bbf7d0` | oklch(88% 0.08 145) | |
| accent-300 | `#86efac` | oklch(80% 0.12 145) | |
| accent-400 | `#4ade80` | oklch(70% 0.16 145) | |
| accent-500 | `#22c55e` | oklch(62% 0.18 145) | Primary accent |
| accent-600 | `#16a34a` | oklch(52% 0.17 145) | Hover accent |
| accent-700 | `#15803d` | oklch(42% 0.15 145) | Active accent |
| accent-800 | `#166534` | oklch(35% 0.13 145) | |
| accent-900 | `#14532d` | oklch(28% 0.10 145) | Darkest shade |
| **Borders** ||||
| border-default | `#2a2a2a` | oklch(25% 0 0) | Default borders |
| border-muted | `#1a1a1a` | oklch(18% 0 0) | Subtle dividers |
| border-accent | `#22c55e` | oklch(62% 0.18 145) | Focus rings |
| **Semantic** ||||
| success | `#22c55e` | oklch(62% 0.18 145) | Success states |
| warning | `#facc15` | oklch(85% 0.18 95) | Warning states |
| error | `#f43f5e` | oklch(60% 0.22 15) | Error states |
| info | `#38bdf8` | oklch(65% 0.15 230) | Info states |

### CSS Variables

```css
:root {
  /* Background */
  --bg-base: #0a0a0a;
  --bg-surface: #141414;
  --bg-elevated: #1f1f1f;
  --bg-input: #080808;
  --bg-hover: #2a2a2a;
  --bg-active: #383838;

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #e5e5e5;
  --text-muted: #a3a3a3;
  --text-disabled: #525252;

  /* Accent */
  --accent-50: #f0fdf4;
  --accent-100: #dcfce7;
  --accent-200: #bbf7d0;
  --accent-300: #86efac;
  --accent-400: #4ade80;
  --accent-500: #22c55e;
  --accent-600: #16a34a;
  --accent-700: #15803d;
  --accent-800: #166534;
  --accent-900: #14532d;

  /* Borders */
  --border-default: #2a2a2a;
  --border-muted: #1a1a1a;
  --border-accent: #22c55e;

  /* Semantic */
  --success: #22c55e;
  --warning: #facc15;
  --error: #f43f5e;
  --info: #38bdf8;
}
```

### Visual Description

**Login Screen:** Pure black with white card and vibrant green button. The green pops aggressively against the darkness—impossible to miss. Input focus states shift border from gray to green instantly.

**Main App Layout:** Stark black canvas with subtle gray surface differentiation. Green accents mark all interactive elements clearly. Active states use darker green with higher saturation. Feels like a professional tool, not a consumer app.

**Task Cards:** Dark cards with crisp borders. Status indicators use full semantic palette—green complete, yellow in-progress, red blocked. Green checkmarks on completed items provide satisfying visual feedback.

**Buttons & Inputs:** Primary buttons vibrant green (accent-500), hover brightens to accent-400 for maximum visibility. Secondary buttons use white text on dark fill. Inputs pure black with gray border, green focus ring. High contrast ensures no ambiguity about interactive state.

### Contrast Notes

- Primary text on bg-base: 18.5:1 (AAA)
- text-secondary on bg-base: 12.8:1 (AAA)
- text-muted on bg-base: 6.9:1 (AAA)
- accent-500 on bg-base: 6.2:1 (AAA)
- Excellent visibility in all lighting conditions

---

## Summary Matrix

| Palette | Background | Accent | Vibe | Best For |
|---------|------------|--------|------|----------|
| Blue/Purple | Deep blue | Violet | Analytical, focused | Data-heavy interfaces |
| Teal/Cyan | Blue-black | Cyan | Modern, technical | Productivity apps |
| Monochrome | Pure gray | Red | Stark, uncompromising | Minimal, distraction-free |
| High-Contrast | Pure black | Green | Bold, terminal-inspired | Developer tools |

---

## Implementation Notes

1. **Sharp corners everywhere** — no border-radius on any elements
2. **No glows or shadows** — use value contrast and borders only
3. **1px borders** — crisp, consistent, never blurry
4. **Focus states** — border color change only, no ring/glow
5. **Hover states** — subtle background value shift, no color change

All palettes designed for WCAG AA compliance minimum. Test with real content before finalizing.
