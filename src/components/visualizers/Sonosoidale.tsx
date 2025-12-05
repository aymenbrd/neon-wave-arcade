import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface SpectrumBar {
  frequency: number;
  targetHeight: number;
  currentHeight: number;
  smoothedValue: number;
}

interface PulseMirrorSpectrum {
  bars: SpectrumBar[];
}

interface PulseMirrorSpectrumProps {
  width: number;
  height: number;
}

// Pulse Mirror Spectrum - mirrored frequency spectrum bars with pulsing beat response
export const PulseMirrorSpectrum: React.FC<PulseMirrorSpectrumProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  
  const BAR_COUNT = 64;
  const specRef = useRef<PulseMirrorSpectrum>({
    bars: Array.from({ length: BAR_COUNT }).map((_, i) => ({
      frequency: i,
      targetHeight: 0,
      currentHeight: 0,
      smoothedValue: 0,
    })),
  });
  const smoothedBassRef = useRef(0);
  const beatRef = useRef(0);
  const prevBassRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const barSpacing = width / BAR_COUNT;
    const maxBarHeight = height * 0.7;

    const draw = () => {
      let spectrum: Uint8Array | null = null;
      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        spectrum = frequencyData;
      }

      // Clear background
      const bg = settings.backgroundColor || '#000000';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const spec = specRef.current;

      // Compute bass level for beat detection
      let bass = 0;
      if (spectrum) {
        const bassBins = 8;
        for (let b = 0; b < bassBins; b++) bass += spectrum[b] || 0;
        bass = bass / (bassBins * 255);
      }

      // Smooth bass for stable pulse
      smoothedBassRef.current += (bass - smoothedBassRef.current) * 0.16;

      // Simple beat detector
      const bassDelta = bass - prevBassRef.current;
      if (bassDelta > 0.1) {
        beatRef.current = Math.min(1, beatRef.current + bassDelta * 7);
      }
      beatRef.current *= 0.88;
      prevBassRef.current = bass;

      // Update each spectrum bar
      spec.bars.forEach((bar, i) => {
        // Map frequency spectrum to bars
        const specIndex = Math.floor((i / spec.bars.length) * (spectrum?.length || 256));
        const rawValue = spectrum ? (spectrum[Math.min(specIndex, spectrum.length - 1)] / 255) : 0;

        // Smooth the value for fluid motion
        bar.smoothedValue += (rawValue - bar.smoothedValue) * 0.26;

        // Apply bass boost and beat intensity
        const bassBoost = 1.2 + smoothedBassRef.current * 1.8 + beatRef.current * 1.5;
        bar.targetHeight = bar.smoothedValue * settings.intensity * bassBoost;

        // Smooth easing for responsive tracking
        bar.currentHeight += (bar.targetHeight - bar.currentHeight) * 0.2;
      });

      // Draw mirrored spectrum bars from center
      spec.bars.forEach((bar, i) => {
        const barX = i * barSpacing;
        const barHeight = bar.currentHeight * maxBarHeight;

        // Color alternates between primary and secondary
        const color = i % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
        const alpha = Math.floor((0.5 + bar.currentHeight * 0.5) * 255)
          .toString(16)
          .padStart(2, '0');

        // Top bar (mirrored up)
        ctx.fillStyle = color + alpha;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 + bar.currentHeight * 40;
        ctx.fillRect(barX, centerY - barHeight, barSpacing * 0.85, barHeight);

        // Bottom bar (mirrored down)
        ctx.fillRect(barX, centerY, barSpacing * 0.85, barHeight);
      });

      // Draw center line pulse
      const centerLineHeight = 6 + smoothedBassRef.current * 20;
      ctx.fillStyle = settings.primaryColor;
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 20 + beatRef.current * 60;
      ctx.fillRect(0, centerY - centerLineHeight / 2, width, centerLineHeight);

      // Draw pulsating glow effect at center
      const glowRadius = 80 + smoothedBassRef.current * 120 * settings.intensity;
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      glowGradient.addColorStop(0, settings.secondaryColor + 'cc');
      glowGradient.addColorStop(0.3, settings.secondaryColor + '44');
      glowGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.shadowColor = settings.secondaryColor;
      ctx.shadowBlur = 40 + beatRef.current * 100;
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [width, height, analyser, frequencyData, settings]);

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />;
};
