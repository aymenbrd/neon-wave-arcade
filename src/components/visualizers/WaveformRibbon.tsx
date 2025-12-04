import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface WaveformRibbonProps {
  width: number;
  height: number;
}

export const WaveformRibbon: React.FC<WaveformRibbonProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, dataArray, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const timeRef = useRef(0);
  const historyRef = useRef<number[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      timeRef.current += 0.03 * settings.speed;
      
      let waveData: number[] = [];
      let bass = 0;
      
      if (analyser && dataArray && frequencyData) {
        analyser.getByteTimeDomainData(dataArray);
        analyser.getByteFrequencyData(frequencyData);
        
        // Sample waveform data
        for (let i = 0; i < 128; i++) {
          const index = Math.floor((i / 128) * dataArray.length);
          waveData.push((dataArray[index] - 128) / 128);
        }
        
        bass = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
      } else {
        // Default sine wave when no audio
        for (let i = 0; i < 128; i++) {
          waveData.push(Math.sin(i * 0.1 + timeRef.current * 2) * 0.3);
        }
      }

      bass *= settings.sensitivity;

      // Store history for 3D effect
      historyRef.current.unshift(waveData);
      if (historyRef.current.length > 30) {
        historyRef.current.pop();
      }

      // Clear
      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Draw grid floor
      ctx.save();
      ctx.translate(0, height * 0.7);
      ctx.strokeStyle = settings.secondaryColor + '30';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 20; i++) {
        const y = i * 20;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      for (let i = 0; i < width / 40; i++) {
        const x = i * 40;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }
      ctx.restore();

      // Draw ribbons from history
      historyRef.current.forEach((wave, histIndex) => {
        const depth = histIndex / historyRef.current.length;
        const yOffset = height * 0.4 + depth * height * 0.3;
        const scale = 1 - depth * 0.5;
        const alpha = (1 - depth) * 0.8;

        ctx.beginPath();
        
        for (let i = 0; i < wave.length; i++) {
          const x = (i / wave.length) * width;
          const amplitude = wave[i] * height * 0.2 * scale * settings.intensity;
          const y = yOffset + amplitude;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Create gradient stroke
        const gradient = ctx.createLinearGradient(0, yOffset - 100, 0, yOffset + 100);
        gradient.addColorStop(0, settings.primaryColor);
        gradient.addColorStop(0.5, settings.secondaryColor);
        gradient.addColorStop(1, settings.primaryColor);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = (4 - depth * 3) * (1 + bass * 2);
        ctx.shadowColor = settings.primaryColor;
        ctx.shadowBlur = 20 - depth * 15 + bass * 20;
        ctx.globalAlpha = alpha;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Fill under the wave
        ctx.lineTo(width, yOffset + height);
        ctx.lineTo(0, yOffset + height);
        ctx.closePath();
        
        const fillGradient = ctx.createLinearGradient(0, yOffset, 0, yOffset + 100);
        fillGradient.addColorStop(0, settings.primaryColor + '20');
        fillGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = fillGradient;
        ctx.globalAlpha = alpha * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw main ribbon (current)
      if (historyRef.current[0]) {
        const wave = historyRef.current[0];
        const yOffset = height * 0.4;
        
        ctx.beginPath();
        for (let i = 0; i < wave.length; i++) {
          const x = (i / wave.length) * width;
          const amplitude = wave[i] * height * 0.25 * settings.intensity;
          const y = yOffset + amplitude;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4 + bass * 6;
        ctx.shadowColor = settings.primaryColor;
        ctx.shadowBlur = 30 + bass * 30;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, analyser, dataArray, frequencyData, settings]);

  return <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />;
};
