import React from 'react';
import { useVisualizer, VisualizerTheme } from '@/contexts/VisualizerContext';
import { Shuffle, Zap, Gauge, Wind, Radio } from 'lucide-react';

const themes: { id: VisualizerTheme; name: string; icon: string }[] = [
  { id: 'dual-pulse-waves', name: 'DUAL PULSE WAVES', icon: '〰️' },
  { id: 'retro-equalizer', name: 'RETRO EQ', icon: '📊' },
  { id: 'pixel-shockwave', name: 'PSYCHO BLOOM CONTOURS', icon: '🌀' },
  { id: 'galaxy-spiral', name: 'GALAXY', icon: '🌌' },
  { id: 'waveform-ribbon', name: 'WAVEFORM', icon: '〰️' },
  { id: 'pulse-mirror-spectrum', name: 'PULSE MIRROR', icon: '📡' },
];

const colorPresets = [
  { primary: '#00ffff', secondary: '#ff00ff', name: 'CYBER' },
  { primary: '#ff0000', secondary: '#ffff00', name: 'FIRE' },
  { primary: '#00ff00', secondary: '#00ffff', name: 'MATRIX' },
  { primary: '#ff00ff', secondary: '#0000ff', name: 'VAPOR' },
  { primary: '#ffff00', secondary: '#ff0000', name: 'SUNSET' },
  { primary: '#ffffff', secondary: '#00ffff', name: 'ICE' },
];

export const CustomizationPanel: React.FC = () => {
  const { settings, updateSettings, setTheme, randomizeTheme } = useVisualizer();

  return (
    <div className="arcade-panel space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-pixel text-sm neon-text-cyan">CUSTOMIZE</h2>
        <button
          onClick={randomizeTheme}
          className="flex items-center gap-2 px-3 py-1 bg-neon-purple/20 border border-neon-purple rounded text-neon-purple text-xs font-arcade hover:bg-neon-purple/30 transition-colors"
        >
          <Shuffle size={14} />
          RANDOM
        </button>
      </div>

      {/* Theme Selection */}
      <div>
        <h3 className="font-arcade text-xs text-neon-magenta mb-3 flex items-center gap-2">
          <Radio size={14} />
          VISUALIZER THEME
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {themes.map(theme => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`p-2 rounded border-2 text-left transition-all ${
                settings.theme === theme.id
                  ? 'border-neon-cyan bg-neon-cyan/10 neon-border-cyan'
                  : 'border-muted hover:border-neon-cyan/50 bg-muted/20'
              }`}
            >
              <span className="text-lg">{theme.icon}</span>
              <p className="font-arcade text-[0.6rem] mt-1 text-foreground">{theme.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div>
        <h3 className="font-arcade text-xs text-neon-magenta mb-3">COLOR PRESET</h3>
        <div className="grid grid-cols-3 gap-2">
          {colorPresets.map(preset => (
            <button
              key={preset.name}
              onClick={() => updateSettings({ 
                primaryColor: preset.primary, 
                secondaryColor: preset.secondary 
              })}
              className={`p-2 rounded border transition-all ${
                settings.primaryColor === preset.primary
                  ? 'border-neon-cyan'
                  : 'border-muted hover:border-neon-cyan/50'
              }`}
            >
              <div className="flex gap-1 justify-center mb-1">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.primary, boxShadow: `0 0 10px ${preset.primary}` }}
                />
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.secondary, boxShadow: `0 0 10px ${preset.secondary}` }}
                />
              </div>
              <p className="font-arcade text-[0.5rem] text-muted-foreground">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <h3 className="font-arcade text-xs text-neon-magenta mb-3">CUSTOM COLORS</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="font-arcade text-[0.6rem] text-foreground w-20">PRIMARY</label>
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => updateSettings({ primaryColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-2 border-muted"
            />
            <span className="font-arcade text-[0.6rem] text-muted-foreground">
              {settings.primaryColor.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="font-arcade text-[0.6rem] text-foreground w-20">SECONDARY</label>
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-2 border-muted"
            />
            <span className="font-arcade text-[0.6rem] text-muted-foreground">
              {settings.secondaryColor.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-arcade text-[0.6rem] text-foreground flex items-center gap-2">
              <Zap size={12} className="text-neon-yellow" />
              INTENSITY
            </label>
            <span className="font-arcade text-[0.6rem] text-neon-cyan">
              {Math.round(settings.intensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={settings.intensity}
            onChange={(e) => updateSettings({ intensity: parseFloat(e.target.value) })}
            className="arcade-slider w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-arcade text-[0.6rem] text-foreground flex items-center gap-2">
              <Wind size={12} className="text-neon-green" />
              SPEED
            </label>
            <span className="font-arcade text-[0.6rem] text-neon-cyan">
              {Math.round(settings.speed * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={settings.speed}
            onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
            className="arcade-slider w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-arcade text-[0.6rem] text-foreground flex items-center gap-2">
              <Gauge size={12} className="text-neon-magenta" />
              SENSITIVITY
            </label>
            <span className="font-arcade text-[0.6rem] text-neon-cyan">
              {Math.round(settings.sensitivity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={settings.sensitivity}
            onChange={(e) => updateSettings({ sensitivity: parseFloat(e.target.value) })}
            className="arcade-slider w-full"
          />
        </div>
      </div>
    </div>
  );
};
