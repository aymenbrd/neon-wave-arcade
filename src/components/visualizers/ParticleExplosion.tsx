import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ParticleExplosionProps {
  width: number;
  height: number;
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const createParticle = (bass: number, centerX: number, centerY: number): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 4 + bass * 8) * settings.speed;
      const colors = [settings.primaryColor, settings.secondaryColor, '#ffffff', '#ff00ff', '#00ff00'];
      
      return {
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 60 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 4 + bass * 6,
      };
    };

    const draw = () => {
      let bass = 0;
      let high = 0;
      
      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        bass = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        high = frequencyData.slice(100, 256).reduce((a, b) => a + b, 0) / 156 / 255;
      }

      bass *= settings.sensitivity;
      high *= settings.sensitivity;

      // Fade effect
      ctx.fillStyle = `rgba(10, 10, 26, ${0.15 / settings.intensity})`;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Spawn particles based on bass
      const spawnCount = Math.floor(bass * 15 * settings.intensity);
      for (let i = 0; i < spawnCount; i++) {
        if (particlesRef.current.length < 500) {
          particlesRef.current.push(createParticle(bass, centerX, centerY));
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gravity
        p.vx *= 0.99; // friction
        p.vy *= 0.99;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) return false;

        const alpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        
        // Glow effect
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        return true;
      });

      // Draw center orb
      const orbSize = 30 + bass * 50 * settings.intensity;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbSize);
      gradient.addColorStop(0, settings.primaryColor);
      gradient.addColorStop(0.5, settings.secondaryColor + '80');
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbSize, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 30 + bass * 50;
      ctx.fill();

      // Draw connecting lines between close particles
      if (high > 0.3) {
        ctx.strokeStyle = settings.primaryColor + '20';
        ctx.lineWidth = 1;
        particlesRef.current.forEach((p1, i) => {
          particlesRef.current.slice(i + 1).forEach(p2 => {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 80) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
        });
      }

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
