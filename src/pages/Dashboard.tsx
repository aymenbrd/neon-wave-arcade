import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioContext } from '@/contexts/AudioContext';
import { ArcadeBackground } from '@/components/arcade/ArcadeBackground';
import { ArcadeButton } from '@/components/arcade/ArcadeButton';
import { WaveformPreview } from '@/components/arcade/WaveformPreview';
import { Upload, Mic, Palette, Play, LogOut, Music, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { loadAudioFile, startMicrophone, isPlaying, audioSource, stopAudio } = useAudioContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isLoadingMic, setIsLoadingMic] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm)$/i)) {
      toast.error('Please upload a valid audio file (MP3, WAV, OGG)');
      return;
    }

    try {
      await loadAudioFile(file);
      toast.success('Audio loaded! Ready to visualize!');
    } catch (error) {
      toast.error('Failed to load audio file');
    }
  };

  const handleMicrophoneStart = async () => {
    setIsLoadingMic(true);
    try {
      await startMicrophone();
      toast.success('Microphone activated!');
    } catch (error) {
      toast.error('Could not access microphone. Please allow permission.');
    } finally {
      setIsLoadingMic(false);
    }
  };

  const handleLogout = () => {
    stopAudio();
    logout();
    navigate('/login');
    toast.success('See you next time, player!');
  };

  return (
    <ArcadeBackground>
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-pixel text-xl md:text-2xl neon-text-cyan mb-2">NEON BEATS</h1>
            <p className="font-arcade text-sm text-muted-foreground">
              Welcome back, <span className="text-neon-magenta">{user?.username || 'PLAYER'}</span>!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/20 border border-destructive rounded font-arcade text-xs text-destructive hover:bg-destructive/30 transition-colors"
          >
            <LogOut size={16} />
            LOGOUT
          </button>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="arcade-card mb-8 text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Music size={48} className="text-neon-cyan animate-float" />
                <Sparkles size={20} className="absolute -top-2 -right-2 text-neon-yellow animate-pulse" />
              </div>
            </div>
            <h2 className="font-pixel text-lg neon-text-magenta mb-2">READY TO PLAY?</h2>
            <p className="font-arcade text-sm text-muted-foreground max-w-md mx-auto">
              Upload your favorite music or use your microphone to experience stunning audio visualizations!
            </p>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Upload Audio */}
            <div className="arcade-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                  <Upload size={24} className="text-neon-cyan" />
                </div>
                <div>
                  <h3 className="font-pixel text-sm text-neon-cyan">UPLOAD AUDIO</h3>
                  <p className="font-arcade text-xs text-muted-foreground">MP3, WAV, OGG files</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <ArcadeButton
                variant="cyan"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                CHOOSE FILE
              </ArcadeButton>
              {audioSource === 'file' && (
                <p className="mt-3 font-arcade text-xs text-neon-green flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  Audio file loaded
                </p>
              )}
            </div>

            {/* Use Microphone */}
            <div className="arcade-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-neon-magenta/20 flex items-center justify-center">
                  <Mic size={24} className="text-neon-magenta" />
                </div>
                <div>
                  <h3 className="font-pixel text-sm text-neon-magenta">USE MICROPHONE</h3>
                  <p className="font-arcade text-xs text-muted-foreground">Real-time audio capture</p>
                </div>
              </div>
              <ArcadeButton
                variant="magenta"
                className="w-full"
                onClick={handleMicrophoneStart}
                disabled={isLoadingMic}
              >
                <Mic size={16} className="mr-2" />
                {isLoadingMic ? 'CONNECTING...' : audioSource === 'microphone' ? 'MIC ACTIVE' : 'START MIC'}
              </ArcadeButton>
              {audioSource === 'microphone' && (
                <p className="mt-3 font-arcade text-xs text-neon-green flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  Microphone active
                </p>
              )}
            </div>

            {/* Choose Visualizer */}
            <div className="arcade-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                  <Zap size={24} className="text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-pixel text-sm text-neon-purple">VISUALIZER</h3>
                  <p className="font-arcade text-xs text-muted-foreground">6 unique themes</p>
                </div>
              </div>
              <ArcadeButton
                variant="purple"
                className="w-full"
                onClick={() => navigate('/visualizer')}
              >
                <Play size={16} className="mr-2" />
                LAUNCH VISUALIZER
              </ArcadeButton>
            </div>

            {/* Customize Colors */}
            <div className="arcade-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-neon-pink/20 flex items-center justify-center">
                  <Palette size={24} className="text-neon-pink" />
                </div>
                <div>
                  <h3 className="font-pixel text-sm text-neon-pink">CUSTOMIZE</h3>
                  <p className="font-arcade text-xs text-muted-foreground">Colors, speed & more</p>
                </div>
              </div>
              <ArcadeButton
                variant="cyan"
                className="w-full"
                onClick={() => navigate('/visualizer')}
              >
                <Palette size={16} className="mr-2" />
                CUSTOMIZE
              </ArcadeButton>
            </div>
          </div>

          {/* Waveform Preview */}
          {isPlaying && (
            <div className="animate-fade-in">
              <WaveformPreview />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="arcade-card text-center">
              <p className="font-pixel text-2xl neon-text-cyan">6</p>
              <p className="font-arcade text-[0.6rem] text-muted-foreground">THEMES</p>
            </div>
            <div className="arcade-card text-center">
              <p className="font-pixel text-2xl neon-text-magenta">∞</p>
              <p className="font-arcade text-[0.6rem] text-muted-foreground">COLORS</p>
            </div>
            <div className="arcade-card text-center">
              <p className="font-pixel text-2xl neon-text-purple">60</p>
              <p className="font-arcade text-[0.6rem] text-muted-foreground">FPS</p>
            </div>
          </div>
        </div>
      </div>
    </ArcadeBackground>
  );
};

export default Dashboard;
