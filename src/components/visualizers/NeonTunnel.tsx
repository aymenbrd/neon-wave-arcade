import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface DualPulseWavesProps {
  width: number;
  height: number;
}

export const DualPulseWaves: React.FC<DualPulseWavesProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const timeRef = useRef(0);
  const smoothedBassRef = useRef(0);
  const smoothedMidRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.016 * settings.speed;

      let bass = 0;
      let mid = 0;
      let high = 0;

      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        bass = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        mid = frequencyData.slice(50, 150).reduce((a, b) => a + b, 0) / 100 / 255;
        high = frequencyData.slice(150, 256).reduce((a, b) => a + b, 0) / 106 / 255;
      }

      bass *= settings.sensitivity;
      mid *= settings.sensitivity;
      high *= settings.sensitivity;

      // Smooth frequency values for fluid motion
      smoothedBassRef.current += (bass - smoothedBassRef.current) * 0.18;
      smoothedMidRef.current += (mid - smoothedMidRef.current) * 0.18;

      // Clear background
      ctx.fillStyle = settings.backgroundColor || '#000000';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw two expanding pulse waves from center
      for (let pulse = 0; pulse < 2; pulse++) {
        const phaseOffset = pulse * Math.PI;
        const waveCount = 8;

        for (let w = 0; w < waveCount; w++) {
          // Create expanding rings with dual-wave interference pattern
          const wavePhase = (timeRef.current * 6 + phaseOffset) % (Math.PI * 2);
          const baseRadius = 40 + w * 35 + smoothedBassRef.current * 80;
          const radius = baseRadius + Math.sin(wavePhase + w * 0.4) * 40 * (0.5 + smoothedMidRef.current);

          // Only draw if within canvas bounds
          if (radius < Math.max(width, height)) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

            // Gradient for smooth wave appearance
            const distanceFactor = 1 - (baseRadius / (Math.max(width, height) * 1.2));
            const color = w % 2 === 0 ? settings.primaryColor : settings.secondaryColor;
            const alpha = Math.floor((0.7 - w * 0.08) * (0.6 + high * 0.4) * 255)
              .toString(16)
              .padStart(2, '0');

            ctx.strokeStyle = color + alpha;
            ctx.lineWidth = 3 + smoothedBassRef.current * 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = color;
            ctx.shadowBlur = 15 + smoothedMidRef.current * 40;
            ctx.stroke();
          }
        }
      }

      // Draw center pulse glow
      const glowRadius = 50 + smoothedBassRef.current * 80 * settings.intensity;
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      glowGradient.addColorStop(0, settings.primaryColor + 'cc');
      glowGradient.addColorStop(0.4, settings.primaryColor + '44');
      glowGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 50 + smoothedMidRef.current * 80;
      ctx.fill();

      // Draw rhythmic center circle that pulses with bass
      const centerCircleRadius = 15 + smoothedBassRef.current * 40 * settings.intensity;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerCircleRadius, 0, Math.PI * 2);
      ctx.fillStyle = settings.secondaryColor;
      ctx.shadowBlur = 30 + smoothedBassRef.current * 60;
      ctx.fill();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, analyser, frequencyData, settings]);

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />;
};
