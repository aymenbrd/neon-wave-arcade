import React, { useRef, useEffect, useState } from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';
import { NeonTunnel } from './NeonTunnel';
import { RetroEqualizer } from './RetroEqualizer';
import { ParticleExplosion } from './ParticleExplosion';
import { GalaxySpiral } from './GalaxySpiral';
import { WaveformRibbon } from './WaveformRibbon';
import { PixelFireworks } from './PixelFireworks';

export const VisualizerCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const { settings } = useVisualizer();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const renderVisualizer = () => {
    const props = { width: dimensions.width, height: dimensions.height };
    
    switch (settings.theme) {
      case 'neon-tunnel':
        return <NeonTunnel {...props} />;
      case 'retro-equalizer':
        return <RetroEqualizer {...props} />;
      case 'particle-explosion':
        return <ParticleExplosion {...props} />;
      case 'galaxy-spiral':
        return <GalaxySpiral {...props} />;
      case 'waveform-ribbon':
        return <WaveformRibbon {...props} />;
      case 'pixel-fireworks':
        return <PixelFireworks {...props} />;
      default:
        return <NeonTunnel {...props} />;
    }
  };

  return (
    <div ref={containerRef} className="visualizer-container w-full h-full crt-scanlines">
      {renderVisualizer()}
    </div>
  );
};
