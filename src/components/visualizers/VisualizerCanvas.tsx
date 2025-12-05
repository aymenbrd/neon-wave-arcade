import React, { useRef, useEffect, useState } from 'react';
import { useVisualizer } from '@/contexts/VisualizerContext';
import { DualPulseWaves } from './NeonTunnel';
import { RetroEqualizer } from './RetroEqualizer';
import { Spiderweb } from './ParticleExplosion';
import { GalaxySpiral } from './GalaxySpiral';
import { WaveformRibbon } from './WaveformRibbon';
import { PulseMirrorSpectrum } from './Sonosoidale';

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
      case 'dual-pulse-waves':
        return <DualPulseWaves {...props} />;
      case 'retro-equalizer':
        return <RetroEqualizer {...props} />;
      case 'pixel-shockwave':
        return <Spiderweb {...props} />;
      case 'galaxy-spiral':
        return <GalaxySpiral {...props} />;
      case 'waveform-ribbon':
        return <WaveformRibbon {...props} />;
      case 'pulse-mirror-spectrum':
        return <PulseMirrorSpectrum {...props} />;
      default:
        return <DualPulseWaves {...props} />;
    }
  };

  return (
    <div ref={containerRef} className="visualizer-container w-full h-full crt-scanlines">
      {renderVisualizer()}
    </div>
  );
};
