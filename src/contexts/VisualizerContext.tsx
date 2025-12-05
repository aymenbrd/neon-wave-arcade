import React, { createContext, useContext, useState } from 'react';

export type VisualizerTheme = 
  | 'dual-pulse-waves'
  | 'retro-equalizer'
  | 'pixel-shockwave'
  | 'galaxy-spiral'
  | 'waveform-ribbon'
  | 'pulse-mirror-spectrum';

export interface VisualizerSettings {
  theme: VisualizerTheme;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  intensity: number;
  speed: number;
  sensitivity: number;
}

interface VisualizerContextType {
  settings: VisualizerSettings;
  updateSettings: (newSettings: Partial<VisualizerSettings>) => void;
  setTheme: (theme: VisualizerTheme) => void;
  randomizeTheme: () => void;
}

const defaultSettings: VisualizerSettings = {
  theme: 'dual-pulse-waves',
  primaryColor: '#00ffff',
  secondaryColor: '#ff00ff',
    backgroundColor: '#000000',
  intensity: 1,
  speed: 1,
  sensitivity: 1,
};

const VisualizerContext = createContext<VisualizerContextType | null>(null);

export const useVisualizer = () => {
  const context = useContext(VisualizerContext);
  if (!context) {
    throw new Error('useVisualizer must be used within VisualizerProvider');
  }
  return context;
};

export const VisualizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<VisualizerSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<VisualizerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setTheme = (theme: VisualizerTheme) => {
    updateSettings({ theme });
  };

  const themes: VisualizerTheme[] = [
    'dual-pulse-waves',
    'retro-equalizer',
    'pixel-shockwave',
    'galaxy-spiral',
    'waveform-ribbon',
    'pulse-mirror-spectrum',
  ];

  const randomizeTheme = () => {
    const currentIndex = themes.indexOf(settings.theme);
    let newIndex = Math.floor(Math.random() * themes.length);
    while (newIndex === currentIndex) {
      newIndex = Math.floor(Math.random() * themes.length);
    }
    setTheme(themes[newIndex]);
  };

  return (
    <VisualizerContext.Provider value={{ settings, updateSettings, setTheme, randomizeTheme }}>
      {children}
    </VisualizerContext.Provider>
  );
};
