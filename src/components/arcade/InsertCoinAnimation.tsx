import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InsertCoinAnimationProps {
  onComplete?: () => void;
}

export const InsertCoinAnimation: React.FC<InsertCoinAnimationProps> = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setShowText(prev => !prev);
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(blinkInterval);
      setIsAnimating(false);
      onComplete?.();
    }, 3000);

    return () => {
      clearInterval(blinkInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  if (!isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-arcade-black">
      <div className="text-center">
        {/* Coin animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 mx-auto animate-coin-insert">
            <svg viewBox="0 0 80 80" className="w-full h-full">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="url(#coinGradient)"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="28"
                fill="url(#coinInner)"
              />
              <text
                x="40"
                y="45"
                textAnchor="middle"
                className="font-pixel text-xs fill-arcade-black"
              >
                $
              </text>
              <defs>
                <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="50%" stopColor="#ffec8b" />
                  <stop offset="100%" stopColor="#ffd700" />
                </linearGradient>
                <radialGradient id="coinInner" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#ffec8b" />
                  <stop offset="100%" stopColor="#ffd700" />
                </radialGradient>
              </defs>
            </svg>
          </div>
          
          {/* Coin slot */}
          <div className="w-24 h-3 mx-auto bg-arcade-dark border-2 border-neon-cyan/50 rounded-sm">
            <div className="w-16 h-1 mx-auto mt-0.5 bg-arcade-black rounded-full" />
          </div>
        </div>

        {/* Blinking text */}
        <p className={cn(
          "font-pixel text-lg neon-text-cyan transition-opacity duration-200",
          showText ? "opacity-100" : "opacity-30"
        )}>
          INSERT COIN
        </p>
        
        <p className="mt-4 font-pixel text-xs text-neon-magenta">
          1 CREDIT = 1 PLAY
        </p>
      </div>
    </div>
  );
};
