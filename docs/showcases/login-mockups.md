# Login Screen Mockup Showcase

**Date:** 2026-03-24
**Purpose:** Evaluate abstract element options for login screen right-half visual
**Design Personality:** Technical Precision

---

## Concept 1: Gradient Mesh

### Visual Description

The gradient mesh concept creates an organic, flowing visual atmosphere on the right half of the login screen. Multiple translucent color blobs slowly drift and morph across a dark background, creating depth through layered semi-transparent shapes. The movement is subtle and hypnotic—blobs expand and contract over 15-30 second cycles, never drawing attention away from the login form but providing visual interest and a sense of aliveness.

The color palette draws from the muted teal accent family, with gradients blending between accent-500 (#14b8a6), accent-700 (#0f766e), and deeper slate tones from the background scale. Secondary blobs in subtle blues and purples add depth without competing with the primary teal. The overall effect is calming yet sophisticated—a premium feel that suggests thoughtfulness and care in design.

The mesh creates a counterpoint to the sharp precision of the login form. While the form embodies "Technical Precision" through clean lines and minimal borders, the gradient mesh adds warmth and approachability. It humanizes the interface without sacrificing professionalism. The animation respects `prefers-reduced-motion` by freezing to a static gradient composition.

### Layout Mockup

**Desktop View (1440px):**
```
+----------------------------------+--------------------------------------+
|                                  |                                      |
|                                  |      .--"""--.                       |
|                                  |    /           \     .---.           |
|         [PriOS Logo]             |   |      .-.    \   /     \          |
|                                  |   |     /   \    | |   .   |         |
|         Email                    |    \   |    |  /   \     /          |
|        +---------------------+   |     '-.|    |.'      '---'           |
|        |                     |   |        \   /                       |
|        +---------------------+   |    .----' '----.                    |
|                                  |   /   .-.      .-\                   |
|         Password                 |  |   /   \    /   \                  |
|        +---------------------+   |   \  |    |  |    |                  |
|        |                     |   |    '--'   '--'-'                    |
|        +---------------------+   |                                      |
|                                  |   [Gradient blobs slowly morphing]    |
|         [  Login Button  ]       |                                      |
|                                  |                                      |
|         Forgot password?         |                                      |
|                                  |                                      |
|                                  |                                      |
+----------------------------------+--------------------------------------+
        40% (Form)                             60% (Gradient Mesh)
```

**Mobile View (375px):**
```
+-----------------------------+
|                             |
|      .--"""--.              |
|    /   .-.    \             |
|   |   /   \    |            |
|    \  |    |  /             |
|     '--'   '--'              |
|   [Gradient Mesh]           |
|   [fades under form]        |
|                             |
+-----------------------------+
|         [PriOS Logo]        |
|                             |
|         Email               |
|        +-----------------+  |
|        |                 |  |
|        +-----------------+  |
|                             |
|         Password            |
|        +-----------------+  |
|        |                 |  |
|        +-----------------+  |
|                             |
|     [   Login Button  ]     |
|                             |
|       Forgot password?      |
|                             |
+-----------------------------+
     Full-width gradient behind
```

### Color Usage

**Palette Fit:** Good for "Technical Precision"

| Token | Usage |
|-------|-------|
| `accent-500` | Primary blob color - muted teal |
| `accent-700` | Secondary blob color - deeper teal |
| `bg-base` (#0f172a) | Background base for mesh |
| `accent-300` | Highlight accents on blob edges |
| Subtle blue-purple | Tertiary depth (low opacity) |

**Rationale:** The gradient mesh uses the established accent palette, maintaining brand consistency while adding visual softness. The dark background ensures the mesh integrates with the overall dark theme.

### Implementation Details

**HTML Structure:**
```html
<div class="login-container">
  <div class="login-form-side">
    <!-- Form content -->
  </div>
  <div class="login-visual-side">
    <canvas id="gradient-mesh" aria-hidden="true"></canvas>
  </div>
</div>
```

**CSS Approach:**
```css
.login-container {
  display: grid;
  grid-template-columns: 2fr 3fr;
  min-height: 100vh;
}

.login-visual-side {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-base);
}

#gradient-mesh {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  .login-visual-side {
    position: absolute;
    inset: 0;
    opacity: 0.3; /* Subtle background */
  }
}

@media (prefers-reduced-motion: reduce) {
  #gradient-mesh {
    /* Static fallback via CSS */
    background: radial-gradient(
      ellipse at 30% 40%,
      var(--color-accent-700) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 60%,
      var(--color-accent-500) 0%,
      transparent 40%
    );
  }
}
```

**Animation Strategy (Canvas):**
- Use HTML5 Canvas with requestAnimationFrame
- 4-6 blob objects with position, velocity, radius, color
- Each blob moves with sine-wave influenced trajectories
- Blobs drawn as radial gradients with blur filter
- Composite with `globalCompositeOperation: 'screen'` for blend effect
- Target 60fps, throttle to 30fps on mobile for battery

**Performance Considerations:**
1. Canvas renders only when visible (IntersectionObserver)
2. Pause animation when tab not visible (Page Visibility API)
3. Reduce blob count and complexity on mobile
4. Use `will-change: transform` sparingly
5. Static fallback for prefers-reduced-motion
6. Consider WebGL for complex effects (overkill here)

### Pros and Cons

**Pros:**
- Modern, premium aesthetic appeal
- Creates visual interest without competing for attention
- Adds warmth to "Technical Precision" personality
- Works well as responsive background
- Animation is subtle and non-distracting
- Strong first impression for login page

**Cons:**
- Requires JavaScript for full effect
- Canvas animation consumes battery on mobile
- More complex to maintain than static images
- May feel disconnected from the "precision" theme
- Accessibility requires careful implementation
- Could increase initial page load time

---

## Concept 2: Technical Blueprint/Schematic

### Visual Description

The technical schematic concept transforms the right half of the login screen into a living system diagram—a blueprint that visualizes the planning system's architecture. Fine grid lines form a subtle coordinate system across the dark background. Nodes represented as small, precise circles or squares are connected by thin lines suggesting data flow and relationships. Some connections pulse gently with the accent color, indicating activity or data movement through the system.

The schematic feels intentional and meaningful rather than decorative. It reinforces the "Technical Precision" personality directly—this is a tool for people who think in systems, plan with intention, and value clarity. The nodes and connections could represent actual concepts: tasks, goals, priorities, time. The visual language suggests flowcharts, circuit diagrams, and architectural blueprints—all precision tools.

The animation is minimal and purposeful. A subtle pulse travels along connection lines every few seconds. Nodes briefly illuminate in sequence as if data were flowing through them. The effect is subtle—visible when looking directly at it but not distracting in peripheral vision. Like a heartbeat monitor, it conveys that the system is alive and functioning. This respects `prefers-reduced-motion` by showing a static schematic.

### Layout Mockup

**Desktop View (1440px):**
```
+----------------------------------+--------------------------------------+
|                                  |  │ . . . . . . . . . . . . . . . │    |
|                                  |  │ . [●]───────[●]───────[●] . │    |
|         [PriOS Logo]             |  │ .  │         │         │  . │    |
|                                  |  │ .  │    ┌────┴────┐    │  . │    |
|         Email                    |  │ . [●]───►[●]      [●]◄──[●] . │    |
|        +---------------------+   |  │ .  │    └────┬────┘    │  . │    |
|        |                     |   |  │ .  │         │         │  . │    |
|        +---------------------+   |  │ .  ▼         ▼         ▼  . │    |
|                                  |  │ . [●]───────[●]───────[●] . │    |
|         Password                 |  │ .  │   │     │     │   │  . │    |
|        +---------------------+   |  │ .  │   └──►[●]◄──┘   │  . │    |
|        |                     |   |  │ .  │         ▲       │  . │    |
|        +---------------------+   |  │ . [●]───────┴───────[●] . │    |
|                                  |  │ . . . . . . . . . . . . . . . │    |
|         [  Login Button  ]       |  │   [Schematic Grid System]   │    |
|                                  |  │                              │    |
|         Forgot password?         |  │   ● Node  ◄► Connection     │    |
|                                  |  │   . Grid   ──── Active Path  │    |
+----------------------------------+--------------------------------------+
        40% (Form)                             60% (Schematic)
```

**Mobile View (375px):**
```
+-----------------------------+
│ . . . . . . . . . . . . . . │
│ . [●]───────[●]───────[●] . │
│ .  │    GRID    │         │ │
│ .  │    SYSTEM  │         │ │
│ . [●]──────────[●]        │ │
│ .   [Schematic Fades]      │ │
+-----------------------------+
│         [PriOS Logo]        │
│                             │
│         Email               │
│        +-----------------+  │
│        |                 |  │
│        +-----------------+  │
│                             │
│         Password            │
│        +-----------------+  │
│        |                 |  │
│        +-----------------+  │
│                             │
│     [   Login Button  ]     │
│                             │
│       Forgot password?      │
+-----------------------------+
   Schematic as subtle overlay
```

### Color Usage

**Palette Fit:** Excellent for "Technical Precision"

| Token | Usage |
|-------|-------|
| `bg-base` (#0f172a) | Schematic background |
| `text-muted` (#64748b) | Grid lines, inactive connections |
| `accent-500` | Active nodes, pulsing connections |
| `accent-300` | Glow on active elements |
| `border-subtle` | Node outlines |

**Rationale:** The schematic directly uses the "Technical Precision" palette. The muted grid lines recede into the background while accent-colored nodes and connections draw the eye. This reinforces the design system visually.

### Implementation Details

**HTML Structure:**
```html
<div class="login-container">
  <div class="login-form-side">
    <!-- Form content -->
  </div>
  <div class="login-visual-side" aria-hidden="true">
    <svg class="schematic-grid" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5"/>
        </pattern>
      </defs>

      <!-- Grid background -->
      <rect width="100%" height="100%" fill="url(#grid)" class="grid-lines"/>

      <!-- Nodes group -->
      <g class="nodes">
        <!-- Nodes rendered via JS or static for SSR -->
      </g>

      <!-- Connections group -->
      <g class="connections">
        <!-- Connections rendered via JS -->
      </g>
    </svg>
  </div>
</div>
```

**CSS Approach:**
```css
.login-visual-side {
  position: relative;
  overflow: hidden;
  background: var(--color-bg-base);
}

.schematic-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--color-text-muted);
}

.grid-lines {
  opacity: 0.3;
}

/* Node styling */
.node {
  fill: transparent;
  stroke: var(--color-accent-500);
  stroke-width: 1.5;
  transition: fill 200ms ease-out;
}

.node.active {
  fill: var(--color-accent-500);
}

/* Connection styling */
.connection {
  stroke: var(--color-text-muted);
  stroke-width: 1;
  fill: none;
  opacity: 0.5;
}

.connection.active {
  stroke: var(--color-accent-500);
  opacity: 1;
}

@media (max-width: 768px) {
  .schematic-grid {
    opacity: 0.15; /* Very subtle on mobile */
  }
}

@media (prefers-reduced-motion: reduce) {
  .node, .connection {
    animation: none !important;
  }
}
```

**Animation Strategy (SVG + CSS):**
- CSS keyframes for pulse effects on connections
- JavaScript to coordinate sequential node illumination
- Use `<animate>` SVG elements for dash-array animation
- Target: 2-3 second cycle for pulse travel
- Pause when not in viewport (IntersectionObserver)

```css
@keyframes pulse-travel {
  0% { stroke-dashoffset: 100; opacity: 0.3; }
  50% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0.3; }
}

.connection.animated {
  stroke-dasharray: 10 5;
  animation: pulse-travel 3s ease-in-out infinite;
}

@keyframes node-glow {
  0%, 100% { fill: transparent; }
  50% { fill: var(--color-accent-500); }
}
```

**Performance Considerations:**
1. SVG is more performant than Canvas for this use case
2. CSS animations are GPU-accelerated
3. Minimal DOM elements (under 50 nodes/connections)
4. `aria-hidden="true"` removes from accessibility tree
5. Static fallback reduces bundle size
6. SVG can be inlined or loaded as sprite

### Pros and Cons

**Pros:**
- Perfectly aligned with "Technical Precision" personality
- Reinforces the product's purpose (planning, systems, precision)
- SVG is lightweight and performant
- Works without JavaScript (static version)
- Animation is subtle and purposeful
- Scales well to any screen size
- Lower battery impact than Canvas animations

**Cons:**
- More "cold" aesthetic than gradient mesh
- Requires careful design to avoid looking like generic "tech" decoration
- Animation must be meaningful, not just decorative
- Grid patterns can feel dated if not executed well
- Less emotional appeal than organic gradients

---

## Comparison and Recommendation

### Side-by-Side Analysis

| Criterion | Gradient Mesh | Technical Schematic |
|-----------|---------------|---------------------|
| **Personality Alignment** | Moderate | Strong |
| **Visual Appeal** | High | Moderate-High |
| **Performance** | Lower (Canvas) | Higher (SVG) |
| **Accessibility** | Requires care | Simpler |
| **Mobile Battery** | Higher drain | Lower drain |
| **Implementation Complexity** | Higher | Lower |
| **Uniqueness** | Common trend | More distinctive |
| **Brand Story** | Warm, approachable | Precise, intentional |
| **Timelessness** | May date quickly | More enduring |

### Decision Matrix

**Gradient Mesh wins if:**
- Prioritizing visual appeal and warmth
- Target audience prefers modern, flowing aesthetics
- Battery/performance is secondary to visual impact
- Brand should feel approachable first, precise second

**Technical Schematic wins if:**
- Staying true to "Technical Precision" personality
- Product story emphasizes systems, planning, precision
- Performance and accessibility are priorities
- Long-term design sustainability matters

### Recommendation

**Recommended: Technical Schematic (Concept 2)**

**Rationale:**

The "Technical Precision" personality is the foundation of the entire redesign. The design document explicitly chose:
- Sharp border radius (2-4px) for efficiency and seriousness
- Muted teal accent for professional, extended-use appropriateness
- Geometric sans + mono accents for precise data display
- Subtle motion that is polished without distraction

The gradient mesh, while visually appealing, works against several of these decisions. It is inherently soft, organic, and flowing—opposites of "precision" and "sharp." It would create visual dissonance: sharp form elements next to organic blobs. This undermines the cohesive personality the redesign aims to establish.

The technical schematic reinforces every design decision. It is:
- **Sharp:** Clean lines, geometric nodes, precise connections
- **Meaningful:** Represents the actual system (tasks, goals, priorities)
- **Professional:** Grid patterns and flowcharts are tools, not decoration
- **Performant:** SVG with CSS animations is lighter than Canvas
- **Accessible:** Simpler fallback implementation, `prefers-reduced-motion` honored by default

**Implementation Priority:**

1. Start with static SVG schematic for immediate implementation
2. Add subtle pulse animations after core functionality
3. Ensure schematic content relates to actual app concepts
4. Consider making nodes interactive hover targets (bonus)

**Alternative Consideration:**

If user testing reveals the schematic feels too cold or technical, a hybrid approach could work: subtle gradient blobs *behind* a simplified schematic overlay. This maintains precision while adding warmth. However, this should be explored only if initial user feedback indicates the schematic is off-putting.

---

## Next Steps

1. [ ] Design schematic node/connection layout
2. [ ] Create static SVG implementation
3. [ ] Implement CSS pulse animations
4. [ ] Test on mobile viewport
5. [ ] Add `prefers-reduced-motion` fallback
6. [ ] A/B test with gradient mesh if needed
7. [ ] Document final implementation in component library

---

**Document Status:** Complete
**Last Updated:** 2026-03-24
