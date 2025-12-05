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
  const smoothedBassRef = useRef(0);
  const prevBassRef = useRef(0);
  const beatRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize stars only once
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

      // smooth bass for a stable pulse, but allow rapid rise for beats
      smoothedBassRef.current += (bass - smoothedBassRef.current) * 0.16;

      // simple beat detector using bass rise and a decay
      const bassDelta = bass - prevBassRef.current;
      if (bassDelta > 0.08) {
        beatRef.current = Math.min(1, beatRef.current + bassDelta * 6);
      }
      // decay the beat intensity gradually
      beatRef.current *= 0.92;
      prevBassRef.current = bass;

      // Clear background
      ctx.fillStyle = settings.backgroundColor || '#000a1a';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw spiral arms
      ctx.save();
      ctx.translate(centerX, centerY);
      
      for (let arm = 0; arm < 4; arm++) {
        const armAngle = (arm / 4) * Math.PI * 2 + timeRef.current * 0.3 * (1 + beatRef.current * 0.6);

        ctx.beginPath();
        for (let i = 0; i < 120; i++) {
          const t = i / 120;
          const spiralAngle = armAngle + t * Math.PI * 3;
          // amplify spiral radius on beats for dramatic expansion
          const r = t * Math.min(width, height) * 0.48 * (1 + (smoothedBassRef.current * 0.6 + beatRef.current * 0.9) * settings.intensity);
          // add small per-point jitter tied to bass for a vibrating look
          const jitter = Math.sin(timeRef.current * 60 + i * 0.8) * smoothedBassRef.current * 6;
          const x = Math.cos(spiralAngle) * (r + jitter);
          const y = Math.sin(spiralAngle) * (r * 0.62 + jitter * 0.6);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // make the stroke bolder and more reactive on beats
        const strokeWidth = 18 + mid * 40 + beatRef.current * 28;
        ctx.strokeStyle = settings.secondaryColor + '70';
        ctx.lineWidth = strokeWidth;
        ctx.shadowColor = settings.secondaryColor;
        ctx.shadowBlur = 30 + smoothedBassRef.current * 80 + beatRef.current * 120;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      // Update and draw stars with beat-driven vibration
      starsRef.current.forEach(star => {
        // spin faster on beats
        star.angle += star.speed * (1 + smoothedBassRef.current * 4 + beatRef.current * 6) * settings.speed;

        const spiralOffset = star.radius * 0.02;
        const x = centerX + Math.cos(star.angle + spiralOffset) * star.radius * (1 + mid * 0.25);
        const y = centerY + Math.sin(star.angle + spiralOffset) * star.radius * 0.62;

        const pulse = 1 + Math.sin(timeRef.current * 6 + star.angle * 0.8) * 0.35 * high;
        const size = Math.max(0.8, star.size * pulse * (1 + smoothedBassRef.current * 3 * settings.intensity + beatRef.current * 2.4));

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 10 + smoothedBassRef.current * 60 + beatRef.current * 130;
        ctx.globalAlpha = Math.max(0.15, star.brightness * (0.4 + smoothedBassRef.current * 0.7 + beatRef.current * 0.6));
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw center black hole, scaling strongly with bass and beats
      const holeSize = 35 + (smoothedBassRef.current * 38 + beatRef.current * 60) * settings.intensity;
      const holeGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, holeSize * 2);
      holeGradient.addColorStop(0, '#000000');
      holeGradient.addColorStop(0.3, settings.primaryColor + '30');
      holeGradient.addColorStop(0.6, settings.secondaryColor + '15');
      holeGradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, holeSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = holeGradient;
      ctx.fill();

      // Accretion disk glow - throbbing on beats
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, holeSize * 1.8, holeSize * 0.7, timeRef.current * (0.5 + beatRef.current * 0.2), 0, Math.PI * 2);
      ctx.strokeStyle = settings.primaryColor;
      ctx.lineWidth = 3 + smoothedBassRef.current * 18 + beatRef.current * 30;
      ctx.shadowColor = settings.primaryColor;
      ctx.shadowBlur = 30 + smoothedBassRef.current * 120 + beatRef.current * 200;
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
