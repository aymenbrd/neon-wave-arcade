import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface RetroEqualizerProps {
  width: number;
  height: number;
}

export const RetroEqualizer: React.FC<RetroEqualizerProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numBars = 32;
    if (barsRef.current.length === 0) {
      barsRef.current = new Array(numBars).fill(0);
    }

    const draw = () => {
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const barWidth = width / numBars - 4;
      const maxHeight = height * 0.85;

      for (let i = 0; i < numBars; i++) {
        let value = 0;
        
        if (analyser && frequencyData) {
          analyser.getByteFrequencyData(frequencyData);
          const index = Math.floor((i / numBars) * frequencyData.length * 0.5);
          value = (frequencyData[index] / 255) * settings.sensitivity;
        }

        // Smooth fall
        const targetHeight = value * maxHeight * settings.intensity;
        barsRef.current[i] += (targetHeight - barsRef.current[i]) * 0.3 * settings.speed;
        
        const barHeight = Math.max(4, barsRef.current[i]);
        const x = i * (barWidth + 4) + 2;
        const y = height - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);
        gradient.addColorStop(0, settings.primaryColor);
        gradient.addColorStop(0.5, settings.secondaryColor);
        gradient.addColorStop(1, '#ffffff');

        // Glow effect
        ctx.shadowColor = settings.primaryColor;
        ctx.shadowBlur = 15 + (barHeight / maxHeight) * 20;

        // Draw bar segments (pixel style)
        const segmentHeight = 8;
        const numSegments = Math.ceil(barHeight / segmentHeight);
        
        for (let s = 0; s < numSegments; s++) {
          const segY = height - (s + 1) * segmentHeight;
          const intensity = s / numSegments;
          
          ctx.fillStyle = intensity > 0.8 
            ? '#ff0000' 
            : intensity > 0.6 
              ? '#ffff00' 
              : settings.primaryColor;
          
          ctx.fillRect(x, segY, barWidth, segmentHeight - 2);
        }

        // Draw peak indicator
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y - 4, barWidth, 3);
      }

      // Draw reflection
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.scale(1, -0.3);
      ctx.translate(0, -height * 4.3);
      
      for (let i = 0; i < numBars; i++) {
        const barHeight = barsRef.current[i];
        const x = i * (barWidth + 4) + 2;
        
        const gradient = ctx.createLinearGradient(x, height, x, height - barHeight * 0.3);
        gradient.addColorStop(0, settings.primaryColor + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight * 0.3, barWidth, barHeight * 0.3);
      }
      ctx.restore();

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
