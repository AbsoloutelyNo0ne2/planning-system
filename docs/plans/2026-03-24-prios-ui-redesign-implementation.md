# Prios UI Redesign Implementation Plan (Updated)

> **For Claude:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task.

**Goal:** Redesign the Prios UI with Technical Precision personality using Blue/Purple palette and fluid blob login visual.

**Architecture:** Incremental refactor approach - update CSS tokens first, then implement fluid blob canvas, then restructure layout. Preserve all existing functionality including authentication, task CRUD, trajectory editing, and mobile swipe gestures.

**Tech Stack:** React, TypeScript, Tailwind CSS, Custom CSS variables, Vite, HTML Canvas API

**Visual Decisions (from exploration):**
- **Palette:** Blue/Purple (hue 280) - not Teal
- **Login Visual:** Full fluid blob canvas with organic shapes - not simple cleanup
- **Layout:** Permanent 1/3 + 2/3 split - no toggle

---

## Phase 1: CSS Token System (Blue/Purple)

### Task 1: Update Color Tokens to Blue/Purple Palette

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css:25-104`

**Step 1: Replace background scale**
Replace the navy backgrounds with deep navy base:
```css
/* Replace background colors */
--color-bg-base: #0c0f1a;
--color-bg-surface: #121625;
--color-bg-elevated: #1a1f30;
--color-bg-input: #0a0d18;
--color-bg-hover: #1e2438;
--color-bg-active: #252b3d;
```

**Step 2: Replace border colors**
```css
/* Replace border colors */
--color-border-subtle: #172033;
--color-border-default: #1e293b;
--color-border-focus: #a855f7;
```

**Step 3: Replace text colors**
```css
/* Replace text colors */
--color-text-primary: #f1f5f9;
--color-text-secondary: #94a3b8;
--color-text-muted: #64748b;
--color-text-disabled: #475569;
```

**Step 4: Replace accent colors with Blue/Purple (hue 280)**
Replace lines 58-67 with:
```css
/* Blue/Purple Accent (hue 280) */
--color-accent-50: oklch(97% 0.02 280);
--color-accent-100: oklch(94% 0.05 280);
--color-accent-200: oklch(88% 0.10 280);
--color-accent-300: oklch(80% 0.14 288);  /* Warm tint #d8b4fe */
--color-accent-400: oklch(70% 0.16 280);  /* #c084fc */
--color-accent-500: oklch(60% 0.18 280);  /* Purple base #a855f7 */
--color-accent-600: oklch(52% 0.16 280);  /* #8b5cf6 */
--color-accent-700: oklch(44% 0.14 265);  /* Cool tint #7c3aed */
--color-accent-800: oklch(36% 0.12 260);
--color-accent-900: oklch(28% 0.10 255);
```

**Step 5: Replace secondary colors with neutral**
Replace lines 74-83 with neutral secondary (no hue tint):
```css
/* Neutral Secondary */
--color-secondary-50: oklch(97% 0.01 260);
--color-secondary-100: oklch(94% 0.02 260);
--color-secondary-200: oklch(88% 0.03 260);
--color-secondary-300: oklch(80% 0.04 260);
--color-secondary-400: oklch(70% 0.05 260);
--color-secondary-500: oklch(60% 0.05 260);
--color-secondary-600: oklch(52% 0.04 260);
--color-secondary-700: oklch(44% 0.04 260);
--color-secondary-800: oklch(36% 0.03 260);
--color-secondary-900: oklch(28% 0.02 260);
```

**Step 6: Add semantic colors**
Add after secondary colors:
```css
/* Semantic Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
```

**Step 7: Run build to verify**
Run: `npm run build`
Expected: Build succeeds with no errors

**Step 8: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Update color tokens to Blue/Purple palette (hue 280)"
```

---

### Task 2: Update Typography Tokens

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css:122-124`

**Step 1: Add Google Fonts import at top of file**
Add after line 17 (after header comment block):
```css
/* Import Inter font for Technical Precision personality */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

**Step 2: Update font stack**
Replace lines 122-124:
```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

**Step 3: Add font-display to html**
In the `@layer base` block, add to `html`:
```css
font-display: swap;
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Add Inter font and update typography tokens"
```

---

### Task 3: Update Border Radius Tokens

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css:218-409`

**Step 1: Update card radius**
Replace `.vesper-card` border-radius:
```css
border-radius: 4px;
```

**Step 2: Update input radius**
Replace `.vesper-input` border-radius:
```css
border-radius: 4px;
```

**Step 3: Update button radius**
Replace `.vesper-btn` border-radius:
```css
border-radius: 4px;
```

**Step 4: Update task item radius**
Replace `.vesper-task-item` border-radius:
```css
border-radius: 4px;
```

**Step 5: Update slider border-radius**
Replace `.vesper-slider` related border-radius values:
```css
.vesper-slider {
  border-radius: 3px;
}
.vesper-slider::-webkit-slider-runnable-track {
  border-radius: 3px;
}
.vesper-slider::-moz-range-track {
  border-radius: 3px;
}
```

**Step 6: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Update border radius to sharp (3-4px)"
```

---

### Task 4: Remove Glow Effects

**Files:**
- Modify: `D:\kilo\planning-system\src\styles\index.css`

**Step 1: Remove glow from input focus**
Replace `.vesper-input:focus` box-shadow:
```css
.vesper-input:focus {
  border-color: var(--color-accent-500);
  outline: none;
  /* Removed glow effect for Technical Precision */
}
```

**Step 2: Remove glow from progress bar**
Replace `.vesper-progress-bar`:
```css
.vesper-progress-bar {
  background: var(--color-accent-500);
  height: 100%;
  border-radius: 3px;
  transition: width var(--duration-moderate) var(--easing-out);
  /* Removed glow effect */
}
```

**Step 3: Remove glow from slider thumb**
Replace `.vesper-slider::-webkit-slider-thumb`:
```css
.vesper-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: var(--color-accent-500);
  border: 1px solid var(--color-accent-600);
  margin-top: -4px;
  transition: background 150ms ease-out;
  cursor: grab;
}
```

**Step 4: Remove text-shadow from slider display**
Replace `.vesper-slider-display-value`:
```css
.vesper-slider-display-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-accent-400);
  font-family: var(--font-mono);
  line-height: 1;
  /* Removed text-shadow */
}
```

**Step 5: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**
```bash
git add src/styles/index.css
git commit -m "refactor: Remove glow effects for Technical Precision"
```

---

## Phase 2: LoginScreen with Fluid Blob Canvas

### Task 5: Create FluidBlobCanvas Component

**Files:**
- Create: `D:\kilo\planning-system\src\components\FluidBlobCanvas.tsx`

**Step 1: Create the canvas component**
Create new file with fluid blob implementation:
```tsx
import React, { useEffect, useRef, useCallback } from 'react';

interface FluidBlobCanvasProps {
  className?: string;
}

interface BlobConfig {
  numBlobs: number;
  pointsPerBlob: number;
  minRadius: number;
  maxRadius: number;
  interactionRadius: number;
  friction: number;
  returnForce: number;
  cursorInfluence: number;
  repulsionStrength: number;
  wobbleSpeed: number;
  morphSpeed: number;
  baseHue: number;
  slowTint: number;
  fastTint: number;
  baseSaturation: number;
  baseLightness: number;
  minBlur: number;
  maxBlur: number;
  motionBlurFactor: number;
  depthDriftSpeed: number;
  depthOscillation: number;
  blobRepulsion: {
    enabled: boolean;
    minDistanceFactor: number;
    strength: number;
    maxDistance: number;
  };
}

const CONFIG: BlobConfig = {
  numBlobs: 5,
  pointsPerBlob: 8,
  minRadius: 200,
  maxRadius: 500,
  interactionRadius: 400,
  friction: 0.92,
  returnForce: 0.003,
  cursorInfluence: 0.15,
  repulsionStrength: 0.18,
  wobbleSpeed: 0.0001,
  morphSpeed: 0.00004,
  baseHue: 280, // Purple base
  slowTint: 8,
  fastTint: -15,
  baseSaturation: 60,
  baseLightness: 55,
  minBlur: 10,
  maxBlur: 60,
  motionBlurFactor: 8,
  depthDriftSpeed: 0.00008,
  depthOscillation: 0.15,
  blobRepulsion: {
    enabled: true,
    minDistanceFactor: 1.5,
    strength: 0.02,
    maxDistance: 600
  }
};

interface FluidBlob {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  points: number;
  hue: number;
  targetHue: number;
  driftX: number;
  driftY: number;
  rotationSpeed: number;
  offsets: Array<{
    amplitude: number;
    frequency: number;
    phase: number;
  }>;
  phase: number;
  morphPhase: number;
  depth: number;
  targetDepth: number;
  depthPhase: number;
  baseDepth: number;
}

class FluidBlobImpl implements FluidBlob {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  points: number;
  hue: number;
  targetHue: number;
  driftX: number;
  driftY: number;
  rotationSpeed: number;
  offsets: Array<{ amplitude: number; frequency: number; phase: number }>;
  phase: number;
  morphPhase: number;
  depth: number;
  targetDepth: number;
  depthPhase: number;
  baseDepth: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.points = CONFIG.pointsPerBlob;
    this.hue = CONFIG.baseHue;
    this.targetHue = CONFIG.baseHue;

    this.driftX = (Math.random() - 0.5) * 0.06;
    this.driftY = (Math.random() - 0.5) * 0.06;
    this.rotationSpeed = (Math.random() - 0.5) * 0.00006;

    this.offsets = [];
    for (let i = 0; i < this.points; i++) {
      this.offsets.push({
        amplitude: Math.random() * 40 + 20,
        frequency: Math.random() * 0.005 + 0.0025,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.phase = Math.random() * Math.PI * 2;
    this.morphPhase = Math.random() * Math.PI * 2;
    this.depth = Math.random();
    this.targetDepth = this.depth;
    this.depthPhase = Math.random() * Math.PI * 2;
    this.baseDepth = this.depth;
  }

  update(canvas: HTMLCanvasElement, time: number) {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    // Map speed to hue tint
    if (speed < 0.5) {
      this.targetHue = CONFIG.baseHue + CONFIG.slowTint;
    } else if (speed < 2) {
      const t = (speed - 0.5) / 1.5;
      this.targetHue = CONFIG.baseHue + CONFIG.slowTint - (CONFIG.slowTint * t);
    } else {
      const t = Math.min((speed - 2) / 4, 1);
      this.targetHue = CONFIG.baseHue + (CONFIG.fastTint * t);
    }
    this.hue = this.hue + (this.targetHue - this.hue) * 0.03;

    // Depth drift
    this.depthPhase += CONFIG.depthDriftSpeed;
    const depthOscillation = Math.sin(this.depthPhase) * CONFIG.depthOscillation;
    this.depth = Math.max(0, Math.min(1, this.baseDepth + depthOscillation));

    // Apply friction
    this.vx *= CONFIG.friction;
    this.vy *= CONFIG.friction;

    // Ambient drift (8x slower)
    const driftTime = time * 0.000025;
    const driftX = Math.sin(driftTime + this.phase) * 40;
    const driftY = Math.cos(driftTime + this.phase * 1.3) * 35;

    const targetX = this.originX + driftX;
    const targetY = this.originY + driftY;

    this.vx += (targetX - this.x) * CONFIG.returnForce;
    this.vy += (targetY - this.y) * CONFIG.returnForce;

    this.x += this.driftX;
    this.y += this.driftY;

    // Wrap around edges
    if (this.x < -this.radius) this.x = canvas.width + this.radius;
    if (this.x > canvas.width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = canvas.height + this.radius;
    if (this.y > canvas.height + this.radius) this.y = -this.radius;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    const normalizedHue = ((this.hue % 360) + 360) % 360;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    // Dynamic blur
    const depthBlur = CONFIG.minBlur + (this.depth * (CONFIG.maxBlur - CONFIG.minBlur));
    const motionBlur = Math.min(speed * CONFIG.motionBlurFactor, 15);
    const dynamicBlur = depthBlur + motionBlur;

    ctx.save();
    ctx.filter = `blur(${dynamicBlur}px)`;

    ctx.beginPath();

    for (let i = 0; i <= this.points; i++) {
      const angle = (i / this.points) * Math.PI * 2 + time * this.rotationSpeed;
      const offset = this.offsets[i % this.points];

      const wobble1 = Math.sin(time * offset.frequency + offset.phase) * offset.amplitude;
      const wobble2 = Math.cos(time * offset.frequency * 0.8 + offset.phase * 0.7) * offset.amplitude * 0.3;
      const morphWobble = Math.sin(time * CONFIG.morphSpeed + this.morphPhase + i * 0.5) * 15;

      const r = this.radius + wobble1 + wobble2 + morphWobble;
      const x = this.x + Math.cos(angle) * r;
      const y = this.y + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevAngle = ((i - 1) / this.points) * Math.PI * 2 + time * this.rotationSpeed;
        const prevOffset = this.offsets[(i - 1) % this.points];
        const prevWobble1 = Math.sin(time * prevOffset.frequency + prevOffset.phase) * prevOffset.amplitude;
        const prevWobble2 = Math.cos(time * prevOffset.frequency * 0.8 + prevOffset.phase * 0.7) * prevOffset.amplitude * 0.3;
        const prevMorphWobble = Math.sin(time * CONFIG.morphSpeed + this.morphPhase + (i - 1) * 0.5) * 15;
        const prevR = this.radius + prevWobble1 + prevWobble2 + prevMorphWobble;

        const cp1x = this.x + Math.cos(prevAngle + 0.3) * prevR * 1.1;
        const cp1y = this.y + Math.sin(prevAngle + 0.3) * prevR * 1.1;

        ctx.quadraticCurveTo(cp1x, cp1y, x, y);
      }
    }

    ctx.closePath();

    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius * 2
    );

    gradient.addColorStop(0, `hsla(${normalizedHue}, ${CONFIG.baseSaturation + 15}%, ${CONFIG.baseLightness + 15}%, 0.9)`);
    gradient.addColorStop(0.3, `hsla(${normalizedHue}, ${CONFIG.baseSaturation + 5}%, ${CONFIG.baseLightness + 5}%, 0.65)`);
    gradient.addColorStop(0.6, `hsla(${normalizedHue}, ${CONFIG.baseSaturation}%, ${CONFIG.baseLightness}%, 0.35)`);
    gradient.addColorStop(1, `hsla(${normalizedHue}, ${CONFIG.baseSaturation - 10}%, ${CONFIG.baseLightness - 10}%, 0)`);

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }
}

export const FluidBlobCanvas: React.FC<FluidBlobCanvasProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<FluidBlobImpl[]>([]);
  const cursorRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, vx: 0, vy: 0, isInCanvas: false });
  const animationRef = useRef<number>(0);

  const initBlobs = useCallback((canvas: HTMLCanvasElement) => {
    const positions = [
      { radius: 350, x: 0.25, y: 0.35 },
      { radius: 450, x: 0.65, y: 0.3 },
      { radius: 300, x: 0.4, y: 0.6 },
      { radius: 400, x: 0.75, y: 0.55 },
      { radius: 280, x: 0.35, y: 0.8 }
    ];

    blobsRef.current = positions.map(pos => {
      const x = pos.x * canvas.width;
      const y = pos.y * canvas.height;
      return new FluidBlobImpl(x, y, pos.radius);
    });
  }, []);

  const applyCursorForce = useCallback(() => {
    const cursor = cursorRef.current;
    if (!cursor.isInCanvas) return;

    blobsRef.current.forEach(blob => {
      const dx = cursor.x - blob.x;
      const dy = cursor.y - blob.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.interactionRadius && dist > 0) {
        const force = (CONFIG.interactionRadius - dist) / CONFIG.interactionRadius;

        blob.vx += cursor.vx * force * CONFIG.cursorInfluence;
        blob.vy += cursor.vy * force * CONFIG.cursorInfluence;

        blob.vx -= (dx / dist) * force * CONFIG.repulsionStrength;
        blob.vy -= (dy / dist) * force * CONFIG.repulsionStrength;
      }
    });
  }, []);

  const applyBlobRepulsion = useCallback(() => {
    if (!CONFIG.blobRepulsion.enabled) return;

    const { minDistanceFactor, strength, maxDistance } = CONFIG.blobRepulsion;

    for (let i = 0; i < blobsRef.current.length; i++) {
      const blobA = blobsRef.current[i];

      for (let j = i + 1; j < blobsRef.current.length; j++) {
        const blobB = blobsRef.current[j];

        const dx = blobB.x - blobA.x;
        const dy = blobB.y - blobA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxDistance) continue;

        const minDist = (blobA.radius + blobB.radius) * minDistanceFactor;

        if (dist < minDist && dist > 0.01) {
          const force = (minDist - dist) / minDist * strength;

          const nx = dx / dist;
          const ny = dy / dist;

          blobA.vx -= nx * force;
          blobA.vy -= ny * force;

          blobB.vx += nx * force;
          blobB.vy += ny * force;
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        initBlobs(canvas);
      }
    };

    const animate = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cursor = cursorRef.current;
      cursor.vx = (cursor.x - cursor.prevX) * 0.5;
      cursor.vy = (cursor.y - cursor.prevY) * 0.5;
      cursor.prevX = cursor.x;
      cursor.prevY = cursor.y;

      applyCursorForce();
      applyBlobRepulsion();

      blobsRef.current.forEach(blob => blob.update(canvas, currentTime));

      const sortedBlobs = [...blobsRef.current].sort((a, b) => a.y - b.y);
      sortedBlobs.forEach(blob => blob.draw(ctx, currentTime));

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [initBlobs, applyCursorForce, applyBlobRepulsion]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    cursorRef.current.x = e.clientX - rect.left;
    cursorRef.current.y = e.clientY - rect.top;
    cursorRef.current.isInCanvas = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    cursorRef.current.isInCanvas = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    cursorRef.current.x = touch.clientX - rect.left;
    cursorRef.current.y = touch.clientY - rect.top;
    cursorRef.current.isInCanvas = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    cursorRef.current.isInCanvas = false;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: 'crosshair' }}
    />
  );
};

export default FluidBlobCanvas;
```

**Step 2: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**
```bash
git add src/components/FluidBlobCanvas.tsx
git commit -m "feat: Create FluidBlobCanvas component with organic blob animation"
```

---

### Task 6: Update LoginScreen with 50/50 Split and Fluid Blobs

**Files:**
- Modify: `D:\kilo\planning-system\src\components\LoginScreen.tsx`

**Step 1: Import FluidBlobCanvas**
Add import at top:
```tsx
import FluidBlobCanvas from './FluidBlobCanvas';
```

**Step 2: Update container structure**
Replace the entire return statement with 50/50 split layout:
```tsx
return (
  <div className="min-h-screen flex">
    {/* LEFT SIDE - Login Form */}
    <div className="flex-1 flex items-center justify-center p-8 bg-[var(--color-bg-base)]">
      <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-accent-300)]" />
          <span className="text-lg font-semibold text-[var(--color-text-primary)]">Planner</span>
        </div>

        {/* Title */}
        <h1 className="text-[1.75rem] font-semibold text-[var(--color-text-primary)] mb-2">
          Welcome back
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-8">
          Sign in to continue to your workspace
        </p>

        {/* Passphrase Input */}
        <div className="mb-5">
          <label className="block text-[0.85rem] font-medium text-[var(--color-text-secondary)] mb-2">
            Passphrase
          </label>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border-default)] rounded-[8px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-500)] focus:outline-none focus:ring-[3px] focus:ring-[rgba(168,85,247,0.15)] transition-all"
            placeholder="Enter your passphrase"
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-br from-[var(--color-accent-500)] to-[#9333ea] rounded-[8px] text-white font-medium hover:translate-y-[-1px] hover:shadow-[0_4px_20px_rgba(168,85,247,0.4)] transition-all"
        >
          Sign in
        </button>

        {/* Divider */}
        <div className="flex items-center my-6 text-[var(--color-text-muted)] text-xs">
          <div className="flex-1 h-px bg-[#1e293b]" />
          <span className="px-4">or</span>
          <div className="flex-1 h-px bg-[#1e293b]" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          Don't have an account?{' '}
          <a href="#" className="text-[var(--color-accent-400)] hover:text-[var(--color-accent-300)]">
            Create one
          </a>
        </p>
      </form>
    </div>

    {/* RIGHT SIDE - Fluid Blob Canvas */}
    <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_40%_40%,#1a1f35_0%,var(--color-bg-base)_70%)]">
      <FluidBlobCanvas className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[rgba(148,163,184,0.5)] text-xs pointer-events-none">
        Move your cursor to interact
      </div>
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_130%_130%_at_center,transparent_35%,rgba(12,15,26,0.5)_100%)] pointer-events-none" />
    </div>
  </div>
);
```

**Step 3: Add mobile responsive styles**
Add after the main container, inside a style tag or as Tailwind classes:
```tsx
{/* Responsive: Hide canvas on mobile */}
<style>{`
  @media (max-width: 900px) {
    .canvas-side { display: none; }
  }
`}</style>
```

Or use Tailwind responsive classes:
```tsx
{/* RIGHT SIDE - Hidden on mobile */}
<div className="hidden md:flex flex-1 relative overflow-hidden ...">
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Test locally**
Run: `npm run dev`
Verify: Login screen shows 50/50 split with fluid blobs on right

**Step 6: Commit**
```bash
git add src/components/LoginScreen.tsx
git commit -m "feat: Redesign LoginScreen with 50/50 split and fluid blob canvas"
```

---

### Task 7: Integrate Fluid Blobs with Authentication Flow

**Files:**
- Modify: `D:\kilo\planning-system\src\components\LoginScreen.tsx`

**Step 1: Preserve existing auth logic**
Ensure the form submission handler remains intact:
```tsx
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onAuthenticate(passphrase);
};
```

**Step 2: Preserve error handling**
If there's error state, keep it visible:
```tsx
{error && (
  <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-[4px] text-[var(--color-error)] text-sm">
    {error}
  </div>
)}
```

**Step 3: Run build to verify**
Run: `npm run build`
Expected: Build succeeds, auth flow preserved

**Step 4: Commit**
```bash
git add src/components/LoginScreen.tsx
git commit -m "refactor: Preserve auth flow in redesigned LoginScreen"
```

---

## Phase 3: Main App Layout (1/3 + 2/3 Permanent Split)

### Task 8: Restructure App.tsx to 1/3 + 2/3 Permanent Split

**Files:**
- Modify: `D:\kilo\planning-system\src\components\App.tsx`

**Step 1: Update main container structure**
Replace the main content area with permanent split layout:
```tsx
// Main container with permanent grid layout
<main className="grid grid-cols-[1fr_2fr] min-h-[calc(100vh-52px)]">
  {/* LEFT COLUMN - Agents (1/3) */}
  <aside className="bg-[var(--color-bg-surface)] border-r border-[var(--color-border-default)] p-4 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto">
    {/* Agents content */}
  </aside>

  {/* RIGHT COLUMN - Task Creation (2/3) */}
  <section className="bg-[var(--color-bg-base)] relative flex flex-col">
    {/* Task creation content */}
  </section>
</main>
```

**Step 2: Update header styling**
Clean, sharp header design:
```tsx
<header className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)]">
  <div className="flex items-center gap-4">
    <span className="bg-[var(--color-bg-elevated)] border border-[var(--color-accent-500)] rounded-[2px] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent-500)] tracking-wide">
      [{userType}]
    </span>
    <button
      onClick={() => setShowTrajectoryEditor(true)}
      className="text-sm text-[var(--color-text-secondary)] px-3 py-1 rounded-[2px] hover:bg-[var(--color-bg-elevated)] transition-colors"
    >
      {trajectory || 'No trajectory set'}
    </button>
  </div>
  <button
    onClick={logout}
    className="px-3.5 py-1.5 text-xs text-[var(--color-text-muted)] border border-[var(--color-border-default)] rounded-[2px] hover:border-[var(--color-accent-500)] hover:text-[var(--color-text-primary)] transition-colors"
  >
    Logout
  </button>
</header>
```

**Step 3: Add mobile responsive override**
Add responsive grid override:
```tsx
{/* Mobile: Stack vertically */}
<main className="grid grid-cols-1 md:grid-cols-[1fr_2fr] min-h-[calc(100vh-52px)]">
  {/* Mobile: Content first, agents second */}
  <section className="order-1 md:order-2">...</section>
  <aside className="order-2 md:order-1 md:sticky ...">...</aside>
</main>
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/components/App.tsx
git commit -m "refactor: Restructure App.tsx with permanent 1/3 + 2/3 split layout"
```

---

### Task 9: Update Agents Panel (Left 1/3)

**Files:**
- Modify: `D:\kilo\planning-system\src\components\App.tsx` (Agents section)

**Step 1: Update agents header**
Clean, uppercase label:
```tsx
<div className="text-[11px] font-semibold text-[var(--color-text-muted)] tracking-widest mb-3">
  AGENTS ({agents.length})
</div>
```

**Step 2: Update agent cards**
Sharp styling with accent border for primary:
```tsx
{agents.map((agent, index) => (
  <div
    key={agent.id}
    className={`p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] rounded-[2px] mb-2 cursor-pointer hover:border-[var(--color-accent-500)] transition-colors ${index === 0 ? 'border-l-2 border-l-[var(--color-accent-500)]' : ''}`}
  >
    <div className="text-sm font-medium text-[var(--color-text-primary)]">
      @ {agent.name}
    </div>
    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
      {agent.role}
    </div>
  </div>
))}
```

**Step 3: Update add actor button**
Dashed border, subtle styling:
```tsx
<button className="w-full p-3 text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border-default)] rounded-[2px] hover:border-[var(--color-accent-500)] hover:text-[var(--color-text-secondary)] transition-colors mt-auto">
  + Add Actor
</button>
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/components/App.tsx
git commit -m "refactor: Update Agents panel with sharp, clean styling"
```

---

### Task 10: Update Task Creation Area (Right 2/3)

**Files:**
- Modify: `D:\kilo\planning-system\src\components\App.tsx` (Task creation section)

**Step 1: Create layered structure**
Tasks behind (semi-visible) + Task form (prominent):
```tsx
{/* TASKS BEHIND - Semi-visible layer */}
<div className="absolute inset-0 p-6 opacity-40 pointer-events-none overflow-y-auto">
  {/* Existing tasks rendered here */}
</div>

{/* TASK CREATION FORM - Prominent overlay */}
<div className="relative z-10 flex items-center justify-center min-h-full p-6">
  <div className="max-w-[520px] w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-[2px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
    {/* Task form content */}
  </div>
</div>
```

**Step 2: Update task sections header**
Clean section headers:
```tsx
<div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[2px] mb-4 overflow-hidden">
  <div className="flex justify-between items-center p-3 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-subtle)]">
    <span className="text-[11px] font-semibold tracking-widest text-[var(--color-text-secondary)]">
      {sectionType}
    </span>
    <span className="text-[10px] text-[var(--color-text-muted)]">
      [{remaining} remaining]
    </span>
  </div>
</div>
```

**Step 3: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**
```bash
git add src/components/App.tsx
git commit -m "refactor: Update Task Creation area with layered design"
```

---

## Phase 4: Component Updates

### Task 11: Redesign TaskInput Component

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TaskInput.tsx`

**Step 1: Update container styling**
Remove glows, apply clean design:
```tsx
<div className="w-full space-y-4">
  <div className="border border-[var(--color-border-subtle)] rounded-[4px] p-4">
    <textarea
      className="w-full bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none"
      style={{ minHeight: '120px' }}
      placeholder="Describe the task in detail..."
    />
  </div>
</div>
```

**Step 2: Update step indicator**
Clean progress display:
```tsx
<div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
  <span className="font-mono">{currentStep}</span>
  <span>/</span>
  <span className="font-mono">{totalSteps}</span>
</div>
```

**Step 3: Update action buttons**
Sharp, clean button styling:
```tsx
<button className="px-4 py-2 bg-[var(--color-accent-600)] text-white font-medium rounded-[4px] hover:bg-[var(--color-accent-500)] transition-colors">
  Continue
</button>
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/components/TaskInput.tsx
git commit -m "refactor: Redesign TaskInput with sharp styling"
```

---

### Task 12: Redesign TaskList and TaskItem

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TaskList.tsx`
- Modify: `D:\kilo\planning-system\src\components\TaskItem.tsx`

**Step 1: Update TaskList container**
```tsx
// TaskList.tsx
<div className="space-y-3">
  {tasks.map(task => (
    <TaskItem key={task.id} task={task} />
  ))}
</div>
```

**Step 2: Update TaskItem card**
Remove hover glow, use border shift:
```tsx
// TaskItem.tsx
<div className="p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[4px] cursor-pointer transition-colors hover:border-[var(--color-border-default)]">
  <div className="flex items-start justify-between gap-4">
    <p className="text-[var(--color-text-primary)]">{task.description}</p>
    <span className="text-[var(--color-text-muted)] text-sm font-mono shrink-0">
      {task.valueClass}
    </span>
  </div>
</div>
```

**Step 3: Update status badges**
Clean, minimal badges:
```tsx
<span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-accent-100)] text-[var(--color-accent-700)] rounded-[2px]">
  {task.type}
</span>
```

**Step 4: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**
```bash
git add src/components/TaskList.tsx src/components/TaskItem.tsx
git commit -m "refactor: Redesign TaskList/TaskItem with clean cards"
```

---

### Task 13: Redesign TrajectoryEditor

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TrajectoryEditor.tsx`

**Step 1: Update modal overlay**
Remove blur, use solid overlay:
```tsx
<div className="fixed inset-0 bg-[var(--color-bg-base)]/90 flex items-center justify-center p-6 z-50">
  {/* Modal content */}
</div>
```

**Step 2: Update modal content**
Sharp corners, clean styling:
```tsx
<div className="w-full max-w-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[4px] p-6">
  <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
    Edit Trajectory
  </h2>
  <textarea
    className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] p-3 focus:border-[var(--color-accent-500)] focus:outline-none rounded-[4px]"
  />
</div>
```

**Step 3: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**
```bash
git add src/components/TrajectoryEditor.tsx
git commit -m "refactor: Redesign TrajectoryEditor with sharp modal"
```

---

### Task 14: Redesign TaskEditModal

**Files:**
- Modify: `D:\kilo\planning-system\src\components\TaskEditModal.tsx`

**Step 1: Update modal styling**
Apply same pattern as TrajectoryEditor:
```tsx
<div className="fixed inset-0 bg-[var(--color-bg-base)]/90 flex items-center justify-center p-6 z-50">
  <div className="w-full max-w-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[4px] p-6">
    {/* Form fields with sharp inputs */}
  </div>
</div>
```

**Step 2: Update form inputs**
```tsx
<input className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-default)] px-3 py-2 text-[var(--color-text-primary)] focus:border-[var(--color-accent-500)] focus:outline-none rounded-[4px]" />
```

**Step 3: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**
```bash
git add src/components/TaskEditModal.tsx
git commit -m "refactor: Redesign TaskEditModal with clean form"
```

---

### Task 15: Redesign Notification

**Files:**
- Modify: `D:\kilo\planning-system\src\components\Notification.tsx`

**Step 1: Update toast styling**
Remove glows, use solid colors:
```tsx
<div className="px-4 py-3 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-[4px]">
  {message}
</div>
```

**Step 2: Run build to verify**
Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**
```bash
git add src/components/Notification.tsx
git commit -m "refactor: Redesign Notification with clean toast"
```

---

## Phase 5: Verification & Deployment

### Task 16: Verify Anti-Pattern Compliance

**Step 1: Run anti-pattern checklist**
Review all components for:
- [ ] No gradients (except semantic progress bars and login gradient)
- [ ] No glassmorphism
- [ ] No border-radius > 4px on structural elements (8px on inputs/buttons is acceptable)
- [ ] No text-shadow or glow effects
- [ ] No eyebrow labels (uppercase + letter-spacing on non-header elements)
- [ ] No KPI grid as default layout

**Step 2: Fix any violations found**
If any anti-patterns remain, create fix commit.

**Step 3: Commit**
```bash
git add -A
git commit -m "fix: Remove remaining anti-patterns"
```

---

### Task 17: Verify Accessibility

**Step 1: Check contrast ratios**
Verify:
- Primary text on background: >= 4.5:1
- Secondary text on background: >= 4.5:1
- Muted text on background: >= 3:1

**Step 2: Check focus states**
Verify all interactive elements have visible focus.

**Step 3: Run build**
Run: `npm run build`
Expected: Build succeeds

---

### Task 18: Build and Deploy

**Step 1: Run production build**
Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Commit all changes**
```bash
git add -A
git commit -m "feat: Complete Prios UI redesign - Blue/Purple palette with fluid blobs"
git push origin main
```

**Step 3: Deploy to Vercel**
Run: `npx vercel --prod`
Expected: Deployment succeeds

**Step 4: Verify deployment**
Navigate to: `https://prios-app.vercel.app`
Verify: All components display with new design

---

## Phase 6: Documentation

### Task 19: Create bruteforce-frontend Skill

**Files:**
- Create: `D:\kilo\.kilo\skills\bruteforce-frontend\SKILL.md`

**Step 1: Create skill directory**
Create the directory structure:
```bash
mkdir -p D:\kilo\.kilo\skills\bruteforce-frontend
```

**Step 2: Create SKILL.md**
Create file with comprehensive frontend debugging and iteration workflow:
```markdown
# bruteforce-frontend Skill

## Purpose
Rapid frontend iteration using HTML previews for visual debugging. Bypasses React/Vite build cycle for 10x faster design iteration.

## When to Use
- Design exploration and visual debugging
- Color palette comparison
- Layout experimentation
- Component styling before React implementation
- Cross-browser visual testing

## Workflow

### 1. Extract Current State
Before starting HTML iteration:
1. Read existing React component
2. Extract current styles (CSS/Tailwind classes)
3. Document the component's props and state requirements

### 2. Create HTML Preview
Create standalone HTML file with:
- Inline CSS using actual CSS variables from the project
- JavaScript for interactivity (vanilla JS, no framework)
- Representative mock data

### 3. Iterate in Browser
1. Open HTML file in browser
2. Use DevTools for live editing
3. Make changes directly in HTML/CSS
4. Refresh to test changes

### 4. Apply Back to React
Once design is finalized:
1. Copy CSS values back to React component
2. Convert inline styles to Tailwind classes if needed
3. Test in actual React app
4. Verify responsiveness

## HTML Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <style>
    /* Copy CSS variables from project */
    :root {
      --color-bg-base: #0c0f1a;
      --color-accent-500: #a855f7;
      /* ... */
    }
    
    /* Component styles */
  </style>
</head>
<body>
  <!-- Component HTML -->
  <script>
    // Interactivity
  </script>
</body>
</html>
```

## File Location
Save HTML previews in: `docs/showcases/html/`

Naming convention: `{component-name}-{variant}.html`

Examples:
- `login-fluid-blobs.html`
- `layout-final.html`
- `palette-final-blue-purple.html`

## Best Practices

### Performance
- Keep HTML files self-contained (no external dependencies)
- Use inline CSS for faster iteration
- Minimize JavaScript complexity

### Fidelity
- Use actual CSS variable values from project
- Match actual component structure
- Include realistic mock data

### Documentation
- Add comments explaining design decisions
- Document any deviations from final implementation
- Note browser-specific fixes

## Common Patterns

### Color Palette Testing
Create side-by-side comparison:
```html
<div style="display: flex; gap: 20px;">
  <div style="background: var(--accent-500);">Option 1</div>
  <div style="background: var(--accent-500-alt);">Option 2</div>
</div>
```

### Layout Testing
Use CSS Grid for quick layout experiments:
```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr;
}
```

### Animation Testing
Use CSS animations for quick tests:
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

## Troubleshooting

### Styles Don't Match React
1. Check CSS variable values
2. Verify Tailwind config alignment
3. Check for global styles affecting component

### Canvas/WebGL Issues
1. Ensure canvas dimensions match container
2. Check for CSS conflicts with canvas element
3. Verify requestAnimationFrame loop is running

### Responsive Issues
1. Test at actual breakpoints
2. Check for missing media queries
3. Verify mobile touch events work

## Integration with Design Rule
This skill works with the `design` rule to:
- Enforce token-based design system
- Prevent AI-generated UI anti-patterns
- Ensure consistency with project personality
```

**Step 3: Commit**
```bash
git add .kilo/skills/bruteforce-frontend/SKILL.md
git commit -m "docs: Create bruteforce-frontend skill for rapid visual iteration"
```

---

## Execution Handoff

**Plan complete and saved to `docs/plans/2026-03-24-prios-ui-redesign-implementation.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)**
- I dispatch fresh subagent per task
- Review between tasks
- Fast iteration with quality gates

**2. Parallel Session (separate)**
- Open new session with executing-plans
- Batch execution with checkpoints

**Which approach?**

---

## Summary of Changes from Original Plan

### Palette Change
- **Original:** Muted Teal (hue 173)
- **Updated:** Blue/Purple (hue 280)

### Login Visual Change
- **Original:** Simple cleanup, remove gradients
- **Updated:** Full fluid blob canvas with organic shapes, dynamic blur, blob repulsion

### Layout Change
- **Original:** Standard layout (implied single column or toggle)
- **Updated:** Permanent 1/3 + 2/3 grid split

### New Component
- **Added:** FluidBlobCanvas.tsx - complete canvas-based animation component

### Preserved Functionality
All existing features remain:
- Authentication flow
- Task CRUD operations
- Trajectory editing
- Mobile swipe gestures
- Notification system
