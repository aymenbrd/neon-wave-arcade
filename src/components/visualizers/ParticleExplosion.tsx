import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

// Helper: convert hex like #rrggbb to rgba(...) with given alpha
function hexToRgba(hex: string, alpha: number) {
  if (!hex) return `rgba(255,255,255,${alpha})`;
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(h.length === 3 ? 1 : 2, h.length === 3 ? 2 : 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(h.length === 3 ? 2 : 4, h.length === 3 ? 3 : 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

interface Mountain {
  x: number;
  height: number;
  targetHeight: number;
  age: number;
  maxAge: number;
  intensity: number;
}

interface PixelShockwave {
  mountains: Mountain[];
  lastShockTime: number;
  pixelGrid: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    originalColor: string;
  }>;
}

interface PixelShockwaveProps {
  width: number;
  height: number;
}

export const PixelShockwave: React.FC<PixelShockwaveProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const shockwaveRef = useRef<PixelShockwave>({
    mountains: Array.from({ length: 16 }).map((_, i) => ({
      x: (i / 16) * width,
      height: 0,
      targetHeight: 0,
      age: 0,
      maxAge: 120,
      intensity: 0,
    })),
    lastShockTime: 0,
    pixelGrid: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const centerX = width / 2;
    const centerY = height / 2;
    // Make the visualization compact by default
    const rings = 3; // fewer concentric contours
    const resolution = Math.max(24, Math.floor(width / 12)); // lower point count for small visuals

    // seed per-ring phase offsets
    const ringPhases = Array.from({ length: rings }).map((_, i) => i * 0.8 + Math.random() * 2);

    const draw = () => {
      let bass = 0;
      let mid = 0;
      let high = 0;
      let amplitude = 0;

      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        bass = frequencyData.slice(0, 8).reduce((a, b) => a + b, 0) / 8 / 255;
        mid = frequencyData.slice(8, 120).reduce((a, b) => a + b, 0) / 112 / 255;
        high = frequencyData.slice(120, 256).reduce((a, b) => a + b, 0) / 136 / 255;
        amplitude = (frequencyData.reduce((a, b) => a + b, 0) / (frequencyData.length * 255));
      }

      bass *= settings.sensitivity * settings.intensity;
      mid *= settings.sensitivity * settings.intensity;
      high *= settings.sensitivity * settings.intensity;

      // background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = settings.backgroundColor || '#000000';
      ctx.fillRect(0, 0, width, height);

      const t = performance.now() / 1000;

      // helper to produce organic warping using sums of sines
      const warp = (angle: number, ringIdx: number) => {
        const phase = ringPhases[ringIdx] + t * (0.45 + ringIdx * 0.04);
        // reduce amplitudes for smaller, tighter warps
        const w1 = Math.sin(angle * (1 + mid * 4) + phase) * (4 + mid * 24);
        const w2 = Math.sin(angle * (2 + mid * 3) - phase * 0.6) * (2 + mid * 12);
        const jitter = (Math.sin(t * 24 + angle * 30 + ringIdx) * 0.5 + Math.random() * 0.5) * high * 4;
        return w1 + w2 + jitter;
      };

      // draw rings back-to-front for additive blending
      for (let r = rings - 1; r >= 0; r--) {
        const ringNorm = r / Math.max(1, rings - 1);
        // smaller base radius for compact look
        const baseRadius = Math.min(width, height) * 0.06 + ringNorm * Math.min(width, height) * 0.18;
        const bassBoost = 1 + bass * (0.75 + ringNorm * 1.6);
        const radius = baseRadius * bassBoost + amplitude * 20 * ringNorm;

        const points: { x: number; y: number }[] = [];
        const twist = t * (0.2 + ringNorm * 0.6) + mid * 2.0;

        for (let i = 0; i < resolution; i++) {
          const angle = (i / resolution) * Math.PI * 2 + twist * (0.05 + ringNorm * 0.2);
          const w = warp(angle, r) * (1 + ringNorm * 0.8);
          const rr = radius + w;
          const x = centerX + Math.cos(angle) * rr;
          const y = centerY + Math.sin(angle) * rr;
          points.push({ x, y });
        }

        // fill contour with neon gradient and soft glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // create radial gradient per ring
        const ringColor = r % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
        const g = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.4);
        g.addColorStop(0, hexToRgba(ringColor, 0.22 * (1 - ringNorm * 0.4)));
        g.addColorStop(0.5, hexToRgba(ringColor, 0.12 * (1 - ringNorm * 0.2)));
        g.addColorStop(1, hexToRgba(ringColor, 0.02));

        ctx.fillStyle = g;
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 12 + ringNorm * 24; // reduced blur for smaller visuals

        // draw smooth path through points using quadratic curves
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const p0 = points[(i + points.length - 1) % points.length];
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const cx = (p1.x + p2.x) / 2;
          const cy = (p1.y + p2.y) / 2;
          if (i === 0) ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(p1.x, p1.y, cx, cy);
        }
        ctx.closePath();
        ctx.fill();

        // stroke for subtle neon edge with jitter from high frequencies
        ctx.lineWidth = 0.8 + ringNorm * 1.2;
        ctx.strokeStyle = hexToRgba(ringColor, 0.75 - ringNorm * 0.4);
        ctx.shadowBlur = 4 + high * 20;
        // optional shimmer line overlay
        ctx.stroke();

        // shimmer pass: small offset stroked line for high-frequency shimmer
        if (high > 0.02) {
          ctx.globalAlpha = Math.min(0.45, high * 1.2);
          ctx.beginPath();
          for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const jitterX = (Math.random() - 0.5) * high * 4;
            const jitterY = (Math.random() - 0.5) * high * 4;
            const next = points[(i + 1) % points.length];
            const cx = (p1.x + next.x) / 2 + jitterX;
            const cy = (p1.y + next.y) / 2 + jitterY;
            if (i === 0) ctx.moveTo(p1.x + jitterX, p1.y + jitterY);
            ctx.quadraticCurveTo(p1.x + jitterX, p1.y + jitterY, cx, cy);
          }
          ctx.closePath();
          ctx.strokeStyle = hexToRgba(ringColor, 0.45 * high);
          ctx.lineWidth = 0.6 + high * 1.8;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.restore();
      }

      // optional light center glow pulsing with bass
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const centerG = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.2 * (0.6 + bass));
      centerG.addColorStop(0, hexToRgba(settings.secondaryColor, 0.08 + bass * 0.45));
      centerG.addColorStop(0.6, hexToRgba(settings.secondaryColor, 0.02 + bass * 0.08));
      centerG.addColorStop(1, hexToRgba(settings.secondaryColor, 0));
      ctx.fillStyle = centerG;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [width, height, analyser, frequencyData, settings]);

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />;
};

// Backwards-compatible alias export
export const Spiderweb = PixelShockwave;
export const ParticleExplosion = PixelShockwave;
