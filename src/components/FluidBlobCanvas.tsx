import React, { useEffect, useRef, useCallback } from 'react';

interface FluidBlobCanvasProps {
  className?: string;
  offsetY?: number; // Offset in pixels (e.g., 150 = shift down 150px)
}

// Configuration types
interface BlobRepulsionConfig {
  enabled: boolean;
  minDistanceFactor: number;
  strength: number;
  maxDistance: number;
}

interface Config {
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
  blurRadius: number;
  minBlur: number;
  maxBlur: number;
  motionBlurFactor: number;
  depthDriftSpeed: number;
  depthOscillation: number;
  blobRepulsion: BlobRepulsionConfig;
}

// Offset configuration for wobble effect
interface OffsetConfig {
  amplitude: number;
  frequency: number;
  phase: number;
}

// FluidBlob class converted to TypeScript
class FluidBlob {
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
  offsets: OffsetConfig[];
  phase: number;
  morphPhase: number;
  depth: number;
  targetDepth: number;
  depthPhase: number;
  baseDepth: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    private config: Config,
    private canvasWidth: number,
    private canvasHeight: number
  ) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.points = config.pointsPerBlob;
    this.hue = config.baseHue;
    this.targetHue = config.baseHue;

    // Drift motion for organic movement
    this.driftX = (Math.random() - 0.5) * 0.06;
    this.driftY = (Math.random() - 0.5) * 0.06;

    // Rotation for more organic shape
    this.rotationSpeed = (Math.random() - 0.5) * 0.00006;

    // Control point offsets for organic wobble
    this.offsets = [];
    for (let i = 0; i < this.points; i++) {
      this.offsets.push({
        amplitude: Math.random() * 40 + 20,
        frequency: Math.random() * 0.005 + 0.0025,
        phase: Math.random() * Math.PI * 2,
      });
    }

    this.phase = Math.random() * Math.PI * 2;
    this.morphPhase = Math.random() * Math.PI * 2;

    // Depth system for dynamic blur
    this.depth = Math.random();
    this.targetDepth = this.depth;
    this.depthPhase = Math.random() * Math.PI * 2;
    this.baseDepth = this.depth;
  }

  update(time: number): void {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    // Update color based on speed
    this.targetHue = this.mapSpeedToTint(speed);
    this.hue = this.hue + (this.targetHue - this.hue) * 0.03;

    // Depth drift - blobs slowly oscillate in Z-space
    this.depthPhase += this.config.depthDriftSpeed;
    const depthOscillation = Math.sin(this.depthPhase) * this.config.depthOscillation;
    this.depth = Math.max(0, Math.min(1, this.baseDepth + depthOscillation));

    // Apply friction
    this.vx *= this.config.friction;
    this.vy *= this.config.friction;

    // Ambient drift
    const driftTime = time * 0.000025;
    const driftX = Math.sin(driftTime + this.phase) * 40;
    const driftY = Math.cos(driftTime + this.phase * 1.3) * 35;

    const targetX = this.originX + driftX;
    const targetY = this.originY + driftY;

    // Return force
    this.vx += (targetX - this.x) * this.config.returnForce;
    this.vy += (targetY - this.y) * this.config.returnForce;

    // Apply drift motion
    this.x += this.driftX;
    this.y += this.driftY;

    // Wrap around edges for continuous movement
    if (this.x < -this.radius) this.x = this.canvasWidth + this.radius;
    if (this.x > this.canvasWidth + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = this.canvasHeight + this.radius;
    if (this.y > this.canvasHeight + this.radius) this.y = -this.radius;

    // Update position
    this.x += this.vx;
    this.y += this.vy;
  }

  private mapSpeedToTint(speed: number): number {
    if (speed < 0.5) {
      return this.config.baseHue + this.config.slowTint;
    } else if (speed < 2) {
      const t = (speed - 0.5) / 1.5;
      return this.config.baseHue + this.config.slowTint - this.config.slowTint * t;
    } else {
      const t = Math.min((speed - 2) / 4, 1);
      return this.config.baseHue + this.config.fastTint * t;
    }
  }

  draw(ctx: CanvasRenderingContext2D, time: number): void {
    const normalizedHue = ((this.hue % 360) + 360) % 360;
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

    // Dynamic blur calculation
    const depthBlur = this.config.minBlur + this.depth * (this.config.maxBlur - this.config.minBlur);
    const motionBlur = Math.min(speed * this.config.motionBlurFactor, 15);
    const dynamicBlur = depthBlur + motionBlur;

    ctx.save();
    ctx.filter = `blur(${dynamicBlur}px)`;

    ctx.beginPath();

    // Draw blob shape with organic wobble
    for (let i = 0; i <= this.points; i++) {
      const angle = (i / this.points) * Math.PI * 2 + time * this.rotationSpeed;
      const offset = this.offsets[i % this.points];

      // Primary wobble
      const wobble1 = Math.sin(time * offset.frequency + offset.phase) * offset.amplitude;
      // Secondary wobble
      const wobble2 =
        Math.cos(time * offset.frequency * 0.8 + offset.phase * 0.7) * offset.amplitude * 0.3;
      // Morph wobble
      const morphWobble = Math.sin(time * this.config.morphSpeed + this.morphPhase + i * 0.5) * 15;

      const r = this.radius + wobble1 + wobble2 + morphWobble;
      const x = this.x + Math.cos(angle) * r;
      const y = this.y + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Smooth bezier curve
        const prevAngle = ((i - 1) / this.points) * Math.PI * 2 + time * this.rotationSpeed;
        const prevOffset = this.offsets[(i - 1) % this.points];
        const prevWobble1 =
          Math.sin(time * prevOffset.frequency + prevOffset.phase) * prevOffset.amplitude;
        const prevWobble2 =
          Math.cos(time * prevOffset.frequency * 0.8 + prevOffset.phase * 0.7) *
          prevOffset.amplitude *
          0.3;
        const prevMorphWobble =
          Math.sin(time * this.config.morphSpeed + this.morphPhase + (i - 1) * 0.5) * 15;
        const prevR = this.radius + prevWobble1 + prevWobble2 + prevMorphWobble;

        // Control points for smooth curves
        const cp1x = this.x + Math.cos(prevAngle + 0.3) * prevR * 1.1;
        const cp1y = this.y + Math.sin(prevAngle + 0.3) * prevR * 1.1;

        ctx.quadraticCurveTo(cp1x, cp1y, x, y);
      }
    }

    ctx.closePath();

    // Radial gradient for soft, fluid look
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 2
    );

    gradient.addColorStop(
      0,
      `hsla(${normalizedHue}, ${this.config.baseSaturation + 15}%, ${this.config.baseLightness + 15}%, 0.9)`
    );
    gradient.addColorStop(
      0.3,
      `hsla(${normalizedHue}, ${this.config.baseSaturation + 5}%, ${this.config.baseLightness + 5}%, 0.65)`
    );
    gradient.addColorStop(
      0.6,
      `hsla(${normalizedHue}, ${this.config.baseSaturation}%, ${this.config.baseLightness}%, 0.35)`
    );
    gradient.addColorStop(
      1,
      `hsla(${normalizedHue}, ${this.config.baseSaturation - 10}%, ${this.config.baseLightness - 10}%, 0)`
    );

    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }

  updateCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
}

const CONFIG: Config = {
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
  baseHue: 280,
    slowTint: -15,
    fastTint: 8,
  baseSaturation: 60,
  baseLightness: 55,
  blurRadius: 30,
    minBlur: 25,
    maxBlur: 100,
  motionBlurFactor: 8,
  depthDriftSpeed: 0.00008,
  depthOscillation: 0.15,
  blobRepulsion: {
    enabled: true,
    minDistanceFactor: 1.5,
    strength: 0.02,
    maxDistance: 600,
  },
};

// Blob position presets
const BLOB_POSITIONS = [
  { radius: 350, x: 0.25, y: 0.35 },
  { radius: 450, x: 0.65, y: 0.3 },
  { radius: 300, x: 0.4, y: 0.6 },
  { radius: 400, x: 0.75, y: 0.55 },
  { radius: 280, x: 0.35, y: 0.8 },
];

const FluidBlobCanvas: React.FC<FluidBlobCanvasProps> = ({ className, offsetY = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<FluidBlob[]>([]);
  const cursorRef = useRef({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    isInCanvas: false,
  });
  const animationFrameRef = useRef<number>(0);

  // Initialize blobs
  const initBlobs = useCallback((width: number, height: number) => {
    blobsRef.current = BLOB_POSITIONS.map((pos) => {
      const x = pos.x * width;
      const y = pos.y * height;
      return new FluidBlob(x, y, pos.radius, CONFIG, width, height);
    });
  }, []);

  // Apply cursor force to blobs
  const applyCursorForce = useCallback(() => {
    const cursor = cursorRef.current;
    if (!cursor.isInCanvas) return;

    blobsRef.current.forEach((blob) => {
      const dx = cursor.x - blob.x;
      const dy = cursor.y - blob.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CONFIG.interactionRadius && dist > 0) {
        const force = (CONFIG.interactionRadius - dist) / CONFIG.interactionRadius;

        // Gentle cursor influence
        blob.vx += cursor.vx * force * CONFIG.cursorInfluence;
        blob.vy += cursor.vy * force * CONFIG.cursorInfluence;

        // Soft repulsion
        blob.vx -= (dx / dist) * force * CONFIG.repulsionStrength;
        blob.vy -= (dy / dist) * force * CONFIG.repulsionStrength;
      }
    });
  }, []);

  // Apply blob-to-blob repulsion
  const applyBlobRepulsion = useCallback(() => {
    if (!CONFIG.blobRepulsion.enabled) return;

    const { minDistanceFactor, strength, maxDistance } = CONFIG.blobRepulsion;
    const blobs = blobsRef.current;

    for (let i = 0; i < blobs.length; i++) {
      const blobA = blobs[i];

      for (let j = i + 1; j < blobs.length; j++) {
        const blobB = blobs[j];

        const dx = blobB.x - blobA.x;
        const dy = blobB.y - blobA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Optimization: skip if too far apart
        if (dist > maxDistance) continue;

        // Minimum distance before repulsion kicks in
        const minDist = (blobA.radius + blobB.radius) * minDistanceFactor;

        if (dist < minDist && dist > 0.01) {
          // Repulsion force (stronger when closer)
          const force = ((minDist - dist) / minDist) * strength;

          // Normalize direction
          const nx = dx / dist;
          const ny = dy / dist;

          // Push A away from B
          blobA.vx -= nx * force;
          blobA.vy -= ny * force;

          // Push B away from A (equal and opposite)
          blobB.vx += nx * force;
          blobB.vy += ny * force;
        }
      }
    }
  }, []);

  // Animation loop
  const animate = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) return;

      const cursor = cursorRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update cursor velocity
      cursor.vx = (cursor.x - cursor.prevX) * 0.5;
      cursor.vy = (cursor.y - cursor.prevY) * 0.5;
      cursor.speed = Math.sqrt(cursor.vx * cursor.vx + cursor.vy * cursor.vy);
      cursor.prevX = cursor.x;
      cursor.prevY = cursor.y;

      // Apply forces
      applyCursorForce();
      applyBlobRepulsion();

      // Update blobs
      blobsRef.current.forEach((blob) => {
        blob.update(currentTime);
      });

      // Sort by y position for depth
      const sortedBlobs = [...blobsRef.current].sort((a, b) => a.y - b.y);

      // Draw blobs
      sortedBlobs.forEach((blob) => {
        blob.draw(ctx, currentTime);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [applyCursorForce, applyBlobRepulsion]
  );

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Update blob dimensions and reinitialize positions
    blobsRef.current.forEach((blob, index) => {
      const pos = BLOB_POSITIONS[index];
      blob.originX = pos.x * canvas.width;
      blob.originY = pos.y * canvas.height;
      blob.x = pos.x * canvas.width;
      blob.y = pos.y * canvas.height;
      blob.updateCanvasDimensions(canvas.width, canvas.height);
    });
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    cursorRef.current.x = e.clientX - rect.left;
    cursorRef.current.y = e.clientY - rect.top;
    cursorRef.current.isInCanvas = true;
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    cursorRef.current.isInCanvas = false;
  }, []);

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    const cursor = cursorRef.current;
    cursor.prevX = cursor.x;
    cursor.prevY = cursor.y;
    cursor.isInCanvas = true;
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;

    cursorRef.current.x = touch.clientX - rect.left;
    cursorRef.current.y = touch.clientY - rect.top;
    cursorRef.current.isInCanvas = true;
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    cursorRef.current.isInCanvas = false;
  }, []);

  // Setup and cleanup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial resize
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      initBlobs(rect.width, rect.height);
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, handleMouseMove, handleMouseLeave, handleMouseEnter, handleTouchMove, handleTouchEnd, handleResize, initBlobs]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          transform: offsetY ? `translateY(${offsetY}px)` : undefined,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
};

export default FluidBlobCanvas;
