import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';

export const WaveformPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, dataArray, isPlaying } = useAudioContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyser || !dataArray) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgba(10, 10, 26, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;

      ctx.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw glow effect
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 6;
      ctx.shadowBlur = 20;
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, dataArray, isPlaying]);

  return (
    <div className="arcade-card p-4">
      <h3 className="font-pixel text-xs text-neon-cyan mb-3">WAVEFORM PREVIEW</h3>
      <canvas
        ref={canvasRef}
        width={400}
        height={100}
        className="w-full h-24 rounded border-2 border-neon-cyan/30"
        style={{ background: 'rgba(10, 10, 26, 0.8)' }}
      />
      {!isPlaying && (
        <p className="text-center mt-2 font-arcade text-xs text-muted-foreground">
          No audio input
        </p>
      )}
    </div>
  );
};
