import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface Pixel {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
  pixels: Pixel[];
}

interface PixelFireworksProps {
  width: number;
  height: number;
}

export const PixelFireworks: React.FC<PixelFireworksProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const fireworksRef = useRef<Firework[]>([]);
  const lastBeatRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false; // Pixel art style

    const colors = [
      settings.primaryColor,
      settings.secondaryColor,
      '#ff0000',
      '#00ff00',
      '#ffff00',
      '#ff00ff',
      '#00ffff',
    ];

    const createFirework = (): Firework => {
      return {
        x: Math.random() * width,
        y: height,
        targetY: height * 0.2 + Math.random() * height * 0.4,
        vy: -8 - Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        exploded: false,
        pixels: [],
      };
    };

    const explodeFirework = (fw: Firework) => {
      const numPixels = 30 + Math.floor(Math.random() * 30);
      for (let i = 0; i < numPixels; i++) {
        const angle = (i / numPixels) * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        fw.pixels.push({
          x: fw.x,
          y: fw.y,
          vx: Math.cos(angle) * speed * settings.speed,
          vy: Math.sin(angle) * speed * settings.speed,
          color: Math.random() > 0.3 ? fw.color : '#ffffff',
          life: 1,
          size: 4 + Math.floor(Math.random() * 4),
        });
      }
      fw.exploded = true;
    };

    const draw = () => {
      let bass = 0;
      let beat = false;
      
      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        bass = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        
        // Beat detection
        if (bass > 0.7 && Date.now() - lastBeatRef.current > 200) {
          beat = true;
          lastBeatRef.current = Date.now();
        }
      }

      bass *= settings.sensitivity;

      // Fade effect
      ctx.fillStyle = 'rgba(10, 5, 20, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Spawn fireworks on beat
      if (beat || (Math.random() < 0.02 * settings.intensity)) {
        if (fireworksRef.current.length < 15) {
          fireworksRef.current.push(createFirework());
        }
      }

      // Update and draw fireworks
      fireworksRef.current = fireworksRef.current.filter(fw => {
        if (!fw.exploded) {
          // Rising
          fw.y += fw.vy * settings.speed;
          fw.vy += 0.1;

          // Draw trail
          ctx.fillStyle = fw.color;
          ctx.shadowColor = fw.color;
          ctx.shadowBlur = 10;
          ctx.fillRect(Math.floor(fw.x / 4) * 4, Math.floor(fw.y / 4) * 4, 4, 8);

          if (fw.y <= fw.targetY || fw.vy >= 0) {
            explodeFirework(fw);
          }
          return true;
        } else {
          // Update pixels
          fw.pixels = fw.pixels.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // gravity
            p.life -= 0.015;

            if (p.life <= 0) return false;

            // Draw pixel (snapped to grid for retro effect)
            const px = Math.floor(p.x / 4) * 4;
            const py = Math.floor(p.y / 4) * 4;
            
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8 * p.life;
            ctx.fillRect(px, py, p.size, p.size);
            ctx.globalAlpha = 1;

            return true;
          });

          return fw.pixels.length > 0;
        }
      });

      // Draw stars in background
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * height * 0.6;
        const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
        ctx.globalAlpha = twinkle * 0.5;
        ctx.fillRect(Math.floor(x / 4) * 4, Math.floor(y / 4) * 4, 2, 2);
      }
      ctx.globalAlpha = 1;

      // Draw ground reflection
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.scale(1, -0.2);
      ctx.translate(0, -height * 6);
      fireworksRef.current.forEach(fw => {
        fw.pixels.forEach(p => {
          const px = Math.floor(p.x / 4) * 4;
          const py = Math.floor(p.y / 4) * 4;
          ctx.fillStyle = p.color;
          ctx.fillRect(px, py, p.size, p.size);
        });
      });
      ctx.restore();

      // Draw pixel border
      ctx.strokeStyle = settings.primaryColor + '40';
      ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, width - 16, height - 16);

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
