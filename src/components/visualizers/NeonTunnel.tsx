import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface NeonTunnelProps {
  width: number;
  height: number;
}

export const NeonTunnel: React.FC<NeonTunnelProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.02 * settings.speed;
      
      let bass = 0;
      let mid = 0;
      
      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        bass = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        mid = frequencyData.slice(10, 100).reduce((a, b) => a + b, 0) / 90 / 255;
      }

      bass *= settings.sensitivity;
      mid *= settings.sensitivity;

      // Clear with fade effect
      ctx.fillStyle = `rgba(10, 10, 26, ${0.1 / settings.intensity})`;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const numRings = 20;

      for (let i = numRings; i > 0; i--) {
        const progress = i / numRings;
        const radius = progress * Math.max(width, height) * (0.8 + bass * 0.5 * settings.intensity);
        const offset = timeRef.current * (1 + mid * 2);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(offset * progress);

        // Create gradient
        const gradient = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, settings.primaryColor + '40');
        gradient.addColorStop(1, settings.secondaryColor + '80');

        // Draw ring
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 + bass * 10 * settings.intensity;
        ctx.shadowColor = settings.primaryColor;
        ctx.shadowBlur = 20 + bass * 30 * settings.intensity;

        ctx.beginPath();
        const sides = 6 + Math.floor(mid * 4);
        for (let j = 0; j <= sides; j++) {
          const angle = (j / sides) * Math.PI * 2;
          const wobble = 1 + Math.sin(timeRef.current * 3 + j) * 0.1 * mid;
          const x = Math.cos(angle) * radius * wobble;
          const y = Math.sin(angle) * radius * wobble;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }

      // Draw center glow
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100 + bass * 100);
      glowGradient.addColorStop(0, settings.primaryColor + 'ff');
      glowGradient.addColorStop(0.5, settings.secondaryColor + '40');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

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
