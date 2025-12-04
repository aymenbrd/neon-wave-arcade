import React, { useRef, useEffect } from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { useVisualizer } from '@/contexts/VisualizerContext';

interface Star {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  brightness: number;
  color: string;
}

interface GalaxySpiralProps {
  width: number;
  height: number;
}

export const GalaxySpiral: React.FC<GalaxySpiralProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { analyser, frequencyData } = useAudioContext();
  const { settings } = useVisualizer();
  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize stars
    if (starsRef.current.length === 0) {
      const colors = [settings.primaryColor, settings.secondaryColor, '#ffffff', '#ffff00', '#ff88ff'];
      for (let i = 0; i < 300; i++) {
        starsRef.current.push({
          angle: Math.random() * Math.PI * 2,
          radius: 20 + Math.random() * Math.max(width, height) * 0.5,
          speed: 0.001 + Math.random() * 0.003,
          size: 1 + Math.random() * 3,
          brightness: 0.3 + Math.random() * 0.7,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    const draw = () => {
      timeRef.current += 0.01 * settings.speed;
      
      let bass = 0;
      let mid = 0;
      let high = 0;
      
      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        bass = frequencyData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
        mid = frequencyData.slice(10, 100).reduce((a, b) => a + b, 0) / 90 / 255;
        high = frequencyData.slice(100, 256).reduce((a, b) => a + b, 0) / 156 / 255;
      }

      bass *= settings.sensitivity;
      mid *= settings.sensitivity;
      high *= settings.sensitivity;

      // Dark background with slight fade
      ctx.fillStyle = `rgba(5, 5, 15, ${0.1 / settings.intensity})`;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw spiral arms
      ctx.save();
      ctx.translate(centerX, centerY);
      
      for (let arm = 0; arm < 4; arm++) {
        const armAngle = (arm / 4) * Math.PI * 2 + timeRef.current;
        
        ctx.beginPath();
        for (let i = 0; i < 100; i++) {
          const t = i / 100;
          const spiralAngle = armAngle + t * Math.PI * 3;
          const r = t * Math.min(width, height) * 0.45 * (1 + bass * 0.3 * settings.intensity);
          const x = Math.cos(spiralAngle) * r;
          const y = Math.sin(spiralAngle) * r * 0.6; // Flatten for perspective
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = settings.secondaryColor + '40';
        ctx.lineWidth = 20 + mid * 30;
        ctx.shadowColor = settings.secondaryColor;
        ctx.shadowBlur = 30;
        ctx.stroke();
      }
      ctx.restore();

      // Update and draw stars
      starsRef.current.forEach(star => {
        star.angle += star.speed * (1 + bass * 3) * settings.speed;
        
        const spiralOffset = star.radius * 0.02;
        const x = centerX + Math.cos(star.angle + spiralOffset) * star.radius * (1 + mid * 0.2);
        const y = centerY + Math.sin(star.angle + spiralOffset) * star.radius * 0.6;
        
        const pulse = 1 + Math.sin(timeRef.current * 5 + star.angle) * 0.3 * high;
        const size = star.size * pulse * (1 + bass * 2 * settings.intensity);
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 10 + bass * 20;
        ctx.globalAlpha = star.brightness * (0.5 + bass * 0.5);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw center black hole
      const holeSize = 40 + bass * 30 * settings.intensity;
      const holeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, holeSize * 2);
      holeGradient.addColorStop(0, '#000000');
      holeGradient.addColorStop(0.3, settings.primaryColor + '40');
      holeGradient.addColorStop(0.6, settings.secondaryColor + '20');
      holeGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, holeSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = holeGradient;
      ctx.fill();

      // Accretion disk glow
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, holeSize * 1.5, holeSize * 0.5, timeRef.current * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = settings.primaryColor;
      ctx.lineWidth = 3 + bass * 10;
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 30 + bass * 40;
      ctx.stroke();

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
