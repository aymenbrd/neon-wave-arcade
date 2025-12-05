import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisualizer, VisualizerTheme } from '@/contexts/VisualizerContext';
import { ArcadeBackground } from '@/components/arcade/ArcadeBackground';
import { ArcadeButton } from '@/components/arcade/ArcadeButton';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

// Add animation styles
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes wave {
    0%, 100% { transform: scaleY(0.5); }
    50% { transform: scaleY(1); }
  }
  @keyframes particle {
    0% { opacity: 1; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(animationStyle);
}

// Preview components for different themes
interface PreviewProps {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  intensity: number;
  speed: number;
  theme: VisualizerTheme;
}

const EqualizerPreview: React.FC<PreviewProps> = ({ primaryColor, secondaryColor, backgroundColor, intensity, speed }) => {
  const [bars, setBars] = useState<number[]>([0.3, 0.6, 0.9, 0.7, 0.85, 0.5, 0.75, 0.4]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 0.9 + 0.1));
    }, 200 / speed);
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className="flex items-end justify-center gap-1 h-24">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all"
          style={{
            height: `${height * 100}%`,
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            boxShadow: i % 2 === 0 ? `0 0 10px ${primaryColor}` : `0 0 10px ${secondaryColor}`,
            opacity: 0.6 + intensity * 0.2,
          }}
        />
      ))}
    </div>
  );
};

const TunnelPreview: React.FC<PreviewProps> = ({ primaryColor, backgroundColor, intensity, speed }) => {
  return (
    <div className="flex items-center justify-center h-24 relative overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute border-2 rounded-full"
          style={{
            width: `${i * 30}px`,
            height: `${i * 30}px`,
            borderColor: primaryColor,
            opacity: 0.6 / i,
            animation: `rotate ${2 / speed}s linear infinite`,
            boxShadow: `0 0 ${i * 3}px ${primaryColor}`,
          }}
        />
      ))}
    </div>
  );
};

const SpiralPreview: React.FC<PreviewProps> = ({ primaryColor, secondaryColor, intensity, speed }) => {
  return (
    <div className="flex items-center justify-center h-24 relative">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            boxShadow: `0 0 8px ${i % 2 === 0 ? primaryColor : secondaryColor}`,
            animation: `rotate ${3 / speed}s linear infinite`,
            left: `calc(50% + ${(i + 1) * 8}px)`,
            transformOrigin: `calc(-${(i + 1) * 8}px) 0`,
            opacity: 0.8 - intensity * 0.1,
          }}
        />
      ))}
    </div>
  );
};

const SpiderwebPreview: React.FC<PreviewProps> = ({ primaryColor, secondaryColor, speed, intensity }) => {
  useEffect(() => {}, [primaryColor, secondaryColor, speed, intensity]);

  return (
    <div className="flex items-center justify-center h-32 relative overflow-hidden" style={{ backgroundColor: '#000' }}>
      <svg viewBox="0 0 240 120" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pbg" x1="0" x2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.06" />
          </linearGradient>
          <filter id="pb-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {[0, 1, 2, 3].map((layer) => {
          const y = 68 - layer * 10 - intensity * 6;
          const amp = 18 + layer * 6 + intensity * 8;
          return (
            <g key={layer} filter="url(#pb-blur)" style={{ mixBlendMode: 'screen' }}>
              <path
                d={`M0 ${y} Q 60 ${y - amp} 120 ${y} T 240 ${y} L 240 120 L 0 120 Z`}
                fill="url(#pbg)"
                opacity={0.75 - layer * 0.12}
                style={{ animation: `pb-float ${6 + layer * 1.5}s ease-in-out infinite` }}
              />
            </g>
          );
        })}

        <ellipse cx="120" cy="44" rx="36" ry="12" fill={secondaryColor} opacity={0.08} filter="url(#pb-blur)" />
      </svg>
      <style>{`
        @keyframes pb-float { 0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)} }
      `}</style>
    </div>
  );
};

const WaveformPreview: React.FC<PreviewProps> = ({ primaryColor, secondaryColor, speed }) => {
  return (
    <div className="flex items-center justify-center h-24 relative overflow-hidden">
      <svg viewBox="0 0 200 80" className="w-full h-full" style={{ filter: `drop-shadow(0 0 8px ${primaryColor})` }}>
        <polyline
          points="0,40 10,30 20,40 30,25 40,40 50,20 60,40 70,30 80,40 90,35 100,40 110,30 120,40 130,28 140,40 150,32 160,40 170,30 180,40 190,35 200,40"
          fill="none"
          stroke={primaryColor}
          strokeWidth="2"
          style={{
            animation: `wave ${1 / speed}s ease-in-out infinite`,
          }}
        />
      </svg>
    </div>
  );
};

const FrequencyRingPreview: React.FC<PreviewProps> = ({ primaryColor, secondaryColor, speed, intensity }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number | undefined;
    const width = canvas.width = canvas.clientWidth * devicePixelRatio;
    const height = canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      // background black
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      const cx = canvas.clientWidth / 2;
      const cy = canvas.clientHeight / 2;
      const rings = 5;
      const t = performance.now() * 0.001 * speed;

      for (let r = 0; r < rings; r++) {
        const base = (r + 1) / (rings + 1) * Math.min(cx, cy) * 0.9;
        const amp = 6 + intensity * 6 + r * 2;
        ctx.beginPath();
        const points = 120;
        for (let i = 0; i <= points; i++) {
          const theta = (i / points) * Math.PI * 2;
          const w = Math.sin(theta * (2 + r * 0.4) + t) * amp;
          const rad = base + w;
          const x = cx + Math.cos(theta) * rad;
          const y = cy + Math.sin(theta) * rad;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.lineWidth = 1.5 + r * 0.5;
        ctx.strokeStyle = r % 2 === 0 ? primaryColor : secondaryColor;
        ctx.globalAlpha = 0.7 - r * 0.08;
        ctx.shadowColor = r % 2 === 0 ? primaryColor : secondaryColor;
        ctx.shadowBlur = 8 + r * 4;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [primaryColor, secondaryColor, speed, intensity]);

  return (
    <div className="flex items-center justify-center h-24 relative overflow-hidden" style={{ backgroundColor: '#000' }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

interface CustomTheme {
  id: string;
  name: string;
  theme: VisualizerTheme;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  intensity: number;
  speed: number;
  sensitivity: number;
}

const AVAILABLE_THEMES: VisualizerTheme[] = [
  'dual-pulse-waves',
  'retro-equalizer',
  'pixel-shockwave',
  'galaxy-spiral',
  'waveform-ribbon',
  'pulse-mirror-spectrum',
];

const PRESET_COLORS = [
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Magenta', value: '#ff00ff' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Red', value: '#ff0000' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Orange', value: '#ff8800' },
  { name: 'Pink', value: '#ff1493' },
  { name: 'Purple', value: '#9d00ff' },
  { name: 'Lime', value: '#00ff88' },
  { name: 'White', value: '#ffffff' },
  { name: 'Violet', value: '#ee82ee' },
];

const Customizer: React.FC = () => {
  const { settings, updateSettings, setTheme } = useVisualizer();
  const navigate = useNavigate();
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(() => {
    const saved = localStorage.getItem('customThemes');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNewThemeForm, setShowNewThemeForm] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [tempSettings, setTempSettings] = useState(settings);

  const saveThemesToLocalStorage = (themes: CustomTheme[]) => {
    localStorage.setItem('customThemes', JSON.stringify(themes));
    setCustomThemes(themes);
  };

  const handleSaveCurrentTheme = () => {
    if (!newThemeName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    const newTheme: CustomTheme = {
      id: Date.now().toString(),
      name: newThemeName,
      theme: tempSettings.theme,
      primaryColor: tempSettings.primaryColor,
      secondaryColor: tempSettings.secondaryColor,
      backgroundColor: tempSettings.backgroundColor,
      intensity: tempSettings.intensity,
      speed: tempSettings.speed,
      sensitivity: tempSettings.sensitivity,
    };

    saveThemesToLocalStorage([...customThemes, newTheme]);
    setNewThemeName('');
    setShowNewThemeForm(false);
    toast.success(`Theme "${newThemeName}" saved!`);
  };

  const handleDeleteTheme = (id: string) => {
    const theme = customThemes.find(t => t.id === id);
    saveThemesToLocalStorage(customThemes.filter(t => t.id !== id));
    toast.success(`Theme "${theme?.name}" deleted!`);
  };

  const handleLoadTheme = (theme: CustomTheme) => {
    setTempSettings({
      theme: theme.theme,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      backgroundColor: theme.backgroundColor,
      intensity: theme.intensity,
      speed: theme.speed,
      sensitivity: theme.sensitivity,
    });
    updateSettings(theme);
    toast.success(`Theme "${theme.name}" loaded!`);
  };

  const handleApplySettings = () => {
    updateSettings(tempSettings);
    toast.success('Settings applied!');
  };

  const renderPreview = () => {
    const previewProps = {
      primaryColor: tempSettings.primaryColor,
      secondaryColor: tempSettings.secondaryColor,
      backgroundColor: tempSettings.backgroundColor,
      intensity: tempSettings.intensity,
      speed: tempSettings.speed,
      theme: tempSettings.theme,
    };

    switch (tempSettings.theme) {
      case 'retro-equalizer':
        return <EqualizerPreview {...previewProps} />;
      case 'dual-pulse-waves':
        return <TunnelPreview {...previewProps} />;
      case 'galaxy-spiral':
        return <SpiralPreview {...previewProps} />;
      case 'pixel-shockwave':
        return <SpiderwebPreview {...previewProps} />;
      case 'waveform-ribbon':
        return <WaveformPreview {...previewProps} />;
      case 'pulse-mirror-spectrum':
        return <EqualizerPreview {...previewProps} />;
      default:
        return <EqualizerPreview {...previewProps} />;
    }
  };

  return (
    <ArcadeBackground>
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 border border-neon-cyan rounded font-arcade text-xs text-neon-cyan hover:bg-neon-cyan/30 transition-colors"
          >
            <ArrowLeft size={16} />
            BACK
          </button>
          <h1 className="font-pixel text-xl md:text-2xl neon-text-cyan">THEME CUSTOMIZER</h1>
          <div className="w-32" />
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Settings Panel */}
            <div className="lg:col-span-2">
              <div className="arcade-card mb-6">
                <h2 className="font-pixel text-lg neon-text-magenta mb-4">CUSTOMIZE SETTINGS</h2>

                {/* Theme Selection */}
                <div className="mb-6">
                  <label className="font-arcade text-sm text-neon-cyan block mb-2">SELECT THEME</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {AVAILABLE_THEMES.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTempSettings({ ...tempSettings, theme: t })}
                        className={`px-3 py-2 rounded font-arcade text-xs transition-all border ${
                          tempSettings.theme === t
                            ? 'bg-neon-cyan/30 border-neon-cyan text-neon-cyan'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-neon-cyan/50'
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <label className="font-arcade text-sm text-neon-cyan block mb-2">PRIMARY COLOR</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTempSettings({ ...tempSettings, primaryColor: color.value })}
                        className="w-full h-10 rounded border-2 transition-all"
                        style={{
                          backgroundColor: color.value,
                          borderColor: tempSettings.primaryColor === color.value ? '#ffffff' : color.value,
                          opacity: tempSettings.primaryColor === color.value ? 1 : 0.7,
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-arcade text-sm text-neon-cyan block mb-2">SECONDARY COLOR</label>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mb-4">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTempSettings({ ...tempSettings, secondaryColor: color.value })}
                        className="w-full h-10 rounded border-2 transition-all"
                        style={{
                          backgroundColor: color.value,
                          borderColor: tempSettings.secondaryColor === color.value ? '#ffffff' : color.value,
                          opacity: tempSettings.secondaryColor === color.value ? 1 : 0.7,
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="font-arcade text-sm text-neon-cyan block mb-2">BACKGROUND COLOR</label>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="color"
                      value={tempSettings.backgroundColor}
                      onChange={(e) => setTempSettings({ ...tempSettings, backgroundColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <span className="font-arcade text-xs text-muted-foreground">{tempSettings.backgroundColor}</span>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="font-arcade text-sm text-neon-cyan block mb-2">
                      INTENSITY: {tempSettings.intensity.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={tempSettings.intensity}
                      onChange={(e) => setTempSettings({ ...tempSettings, intensity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="font-arcade text-sm text-neon-cyan block mb-2">
                      SPEED: {tempSettings.speed.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={tempSettings.speed}
                      onChange={(e) => setTempSettings({ ...tempSettings, speed: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="font-arcade text-sm text-neon-cyan block mb-2">
                      SENSITIVITY: {tempSettings.sensitivity.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={tempSettings.sensitivity}
                      onChange={(e) => setTempSettings({ ...tempSettings, sensitivity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <ArcadeButton variant="cyan" className="flex-1" onClick={handleApplySettings}>
                    <Save size={16} className="mr-2" />
                    APPLY
                  </ArcadeButton>
                </div>
              </div>
            </div>

            {/* Preview and Saved Themes */}
            <div>
              <div className="arcade-card mb-6">
                <h3 className="font-pixel text-sm neon-text-magenta mb-4">LIVE PREVIEW</h3>
                <div
                  className="w-full rounded mb-4 border-2 p-4 overflow-hidden"
                  style={{ 
                    backgroundColor: tempSettings.backgroundColor,
                    borderColor: tempSettings.primaryColor,
                  }}
                >
                  {renderPreview()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-arcade">
                  <div>
                    <p className="text-muted-foreground">THEME</p>
                    <p className="text-neon-cyan font-pixel">{tempSettings.theme.toUpperCase().replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">SPEED</p>
                    <p className="text-neon-magenta">{tempSettings.speed.toFixed(1)}x</p>
                  </div>
                </div>
              </div>

              <div className="arcade-card">
                <h3 className="font-pixel text-sm neon-text-magenta mb-4">SAVED THEMES</h3>
                
                {showNewThemeForm ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Theme name..."
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-neon-cyan rounded font-arcade text-xs mb-2"
                    />
                    <div className="flex gap-2">
                      <ArcadeButton variant="cyan" className="flex-1 text-xs" onClick={handleSaveCurrentTheme}>
                        SAVE
                      </ArcadeButton>
                      <ArcadeButton
                        variant="magenta"
                        className="flex-1 text-xs"
                        onClick={() => {
                          setShowNewThemeForm(false);
                          setNewThemeName('');
                        }}
                      >
                        CANCEL
                      </ArcadeButton>
                    </div>
                  </div>
                ) : (
                  <ArcadeButton
                    variant="cyan"
                    className="w-full mb-4 text-xs"
                    onClick={() => setShowNewThemeForm(true)}
                  >
                    <Plus size={14} className="mr-1" />
                    NEW THEME
                  </ArcadeButton>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customThemes.length === 0 ? (
                    <p className="font-arcade text-xs text-muted-foreground text-center py-4">
                      No saved themes yet
                    </p>
                  ) : (
                    customThemes.map((theme) => (
                      <div
                        key={theme.id}
                        className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-700 rounded hover:border-neon-cyan/50 transition-colors"
                      >
                        <button
                          onClick={() => handleLoadTheme(theme)}
                          className="flex-1 text-left font-arcade text-xs text-neon-cyan hover:text-neon-magenta transition-colors"
                        >
                          {theme.name}
                        </button>
                        <button
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="arcade-card text-center">
            <p className="font-arcade text-sm text-muted-foreground">
              Create and save your own custom themes! Adjust the settings above and save them for later use.
            </p>
          </div>
        </div>
      </div>
    </ArcadeBackground>
  );
};

export default Customizer;
