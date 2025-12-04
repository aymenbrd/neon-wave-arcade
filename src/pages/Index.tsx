import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArcadeBackground } from '@/components/arcade/ArcadeBackground';
import { Gamepad2 } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <ArcadeBackground>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta mb-6 animate-glow-pulse">
            <Gamepad2 size={48} className="text-arcade-black" />
          </div>
          <h1 className="font-pixel text-3xl neon-text-cyan mb-4">NEON BEATS</h1>
          <p className="font-arcade text-sm text-muted-foreground animate-pulse">LOADING...</p>
        </div>
      </div>
    </ArcadeBackground>
  );
};

export default Index;
