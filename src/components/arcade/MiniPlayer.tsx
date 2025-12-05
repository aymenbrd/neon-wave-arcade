import React from 'react';
import { useAudioContext } from '@/contexts/AudioContext';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const { isPlaying, audioSource, currentTime, duration, playAudio, pauseAudio, seekAudio } = useAudioContext();

  // Only show if audio file is loaded
  if (audioSource !== 'file') {
    return null;
  }

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekAudio(parseFloat(e.target.value));
  };

  const handleSkipBack = () => {
    seekAudio(Math.max(0, currentTime - 5));
  };

  const handleSkipForward = () => {
    seekAudio(Math.min(duration, currentTime + 5));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:max-w-sm md:left-auto md:right-8 arcade-card z-50 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="flex-shrink-0 w-12 h-12 rounded-lg bg-neon-cyan/20 border border-neon-cyan flex items-center justify-center hover:bg-neon-cyan/30 transition-colors"
        >
          {isPlaying ? (
            <Pause size={20} className="text-neon-cyan" />
          ) : (
            <Play size={20} className="text-neon-cyan ml-1" />
          )}
        </button>

        {/* Progress Slider */}
        <div className="flex-1">
          {/* Time Display */}
          <div className="flex justify-between font-arcade text-xs text-muted-foreground mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="0"
            max={isFinite(duration) ? duration : 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            style={{
              background: `linear-gradient(to right, #00ffff 0%, #00ffff ${progressPercent}%, #333 ${progressPercent}%, #333 100%)`,
            }}
          />
        </div>

        {/* Skip Buttons */}
        <button
          onClick={handleSkipBack}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-magenta/20 border border-neon-magenta flex items-center justify-center hover:bg-neon-magenta/30 transition-colors"
          title="Skip back 5s"
        >
          <SkipBack size={16} className="text-neon-magenta" />
        </button>

        <button
          onClick={handleSkipForward}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-magenta/20 border border-neon-magenta flex items-center justify-center hover:bg-neon-magenta/30 transition-colors"
          title="Skip forward 5s"
        >
          <SkipForward size={16} className="text-neon-magenta" />
        </button>
      </div>
    </div>
  );
};
