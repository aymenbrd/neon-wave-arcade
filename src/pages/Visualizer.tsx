import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioContext } from '@/contexts/AudioContext';
import { VisualizerCanvas } from '@/components/visualizers/VisualizerCanvas';
import { CustomizationPanel } from '@/components/panels/CustomizationPanel';
import { MiniPlayer } from '@/components/arcade/MiniPlayer';
import { ArrowLeft, Settings, Upload, Mic, MicOff, Share2, Maximize, Minimize, X } from 'lucide-react';
import { toast } from 'sonner';

const Visualizer: React.FC = () => {
  const navigate = useNavigate();
  const { loadAudioFile, startMicrophone, stopAudio, isPlaying, audioSource } = useAudioContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await loadAudioFile(file);
      toast.success('Audio loaded!');
    } catch (error) {
      toast.error('Failed to load audio');
    }
  };

  const handleMicToggle = async () => {
    if (audioSource === 'microphone') {
      stopAudio();
      toast.success('Microphone stopped');
    } else {
      try {
        await startMicrophone();
        toast.success('Microphone active!');
      } catch (error) {
        toast.error('Could not access microphone');
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-arcade-black overflow-hidden">
      {/* Visualizer */}
      <VisualizerCanvas />

      {/* CRT Overlay */}
      <div className="crt-scanlines absolute inset-0 pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-arcade-dark/80 backdrop-blur border border-neon-cyan/30 rounded-lg text-neon-cyan font-arcade text-xs hover:bg-arcade-dark transition-colors"
        >
          <ArrowLeft size={16} />
          BACK
        </button>

        <div className="flex items-center gap-2">
          {/* Audio source indicator */}
          {isPlaying && (
            <div className="px-3 py-2 bg-arcade-dark/80 backdrop-blur border border-neon-green/30 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              <span className="font-arcade text-xs text-neon-green">
                {audioSource === 'file' ? 'FILE' : 'MIC'}
              </span>
            </div>
          )}

          <button
            onClick={handleShare}
            className="p-2 bg-arcade-dark/80 backdrop-blur border border-neon-purple/30 rounded-lg text-neon-purple hover:bg-arcade-dark transition-colors"
            title="Share"
          >
            <Share2 size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-arcade-dark/80 backdrop-blur border border-neon-cyan/30 rounded-lg text-neon-cyan hover:bg-arcade-dark transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <button
            onClick={() => setShowPanel(!showPanel)}
            className={`p-2 bg-arcade-dark/80 backdrop-blur border rounded-lg transition-colors ${
              showPanel 
                ? 'border-neon-magenta text-neon-magenta' 
                : 'border-neon-magenta/30 text-neon-magenta hover:bg-arcade-dark'
            }`}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center justify-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-3 bg-arcade-dark/80 backdrop-blur border border-neon-cyan/50 rounded-lg text-neon-cyan font-arcade text-xs hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all"
          >
            <Upload size={18} />
            UPLOAD
          </button>

          <button
            onClick={handleMicToggle}
            className={`flex items-center gap-2 px-6 py-3 bg-arcade-dark/80 backdrop-blur border rounded-lg font-arcade text-xs transition-all ${
              audioSource === 'microphone'
                ? 'border-neon-green text-neon-green shadow-[0_0_20px_rgba(0,255,0,0.3)]'
                : 'border-neon-magenta/50 text-neon-magenta hover:border-neon-magenta hover:shadow-[0_0_20px_rgba(255,0,255,0.3)]'
            }`}
          >
            {audioSource === 'microphone' ? <MicOff size={18} /> : <Mic size={18} />}
            {audioSource === 'microphone' ? 'STOP MIC' : 'USE MIC'}
          </button>
        </div>

        {/* No audio message */}
        {!isPlaying && (
          <p className="text-center mt-4 font-arcade text-sm text-muted-foreground animate-pulse">
            Upload audio or enable microphone to start visualization
          </p>
        )}
      </div>

      {/* Settings Panel */}
      {showPanel && (
        <div className="absolute top-16 right-4 w-80 z-30 animate-slide-up">
          <div className="relative">
            <button
              onClick={() => setShowPanel(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-arcade-dark border border-neon-magenta rounded-full flex items-center justify-center text-neon-magenta hover:bg-neon-magenta/20 transition-colors z-10"
            >
              <X size={16} />
            </button>
            <CustomizationPanel />
          </div>
        </div>
      )}

      {/* Mini Player */}
      <div className="absolute bottom-20 left-4 right-4 md:bottom-4 md:right-4 md:max-w-sm z-20">
        <MiniPlayer />
      </div>

      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-neon-cyan/30" />
      <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-neon-cyan/30" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-neon-magenta/30" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-neon-magenta/30" />
    </div>
  );
};

export default Visualizer;
