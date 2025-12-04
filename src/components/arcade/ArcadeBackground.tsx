import React from 'react';

export const ArcadeBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Star field */}
      <div className="absolute inset-0 starfield opacity-50" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-arcade-black/80" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-magenta/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-cyan/15 rounded-full blur-[80px] animate-float" style={{ animationDelay: '3s' }} />
      
      {/* CRT scanlines */}
      <div className="crt-scanlines crt-flicker absolute inset-0 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
