import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArcadeBackground } from '@/components/arcade/ArcadeBackground';
import { ArcadeButton } from '@/components/arcade/ArcadeButton';
import { ArcadeInput } from '@/components/arcade/ArcadeInput';
import { InsertCoinAnimation } from '@/components/arcade/InsertCoinAnimation';
import { Mail, Lock, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, player!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials. Try again!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ArcadeBackground>
      {showAnimation && (
        <InsertCoinAnimation onComplete={() => setShowAnimation(false)} />
      )}
      
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-magenta mb-4 animate-glow-pulse">
              <Gamepad2 size={40} className="text-arcade-black" />
            </div>
            <h1 className="font-pixel text-2xl neon-text-cyan mb-2">NEON BEATS</h1>
            <p className="font-arcade text-sm text-muted-foreground">AUDIO VISUALIZER</p>
          </div>

          {/* Login Form */}
          <div className="arcade-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-6">
              <h2 className="font-pixel text-sm neon-text-magenta insert-coin">
                PLAYER LOGIN
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ArcadeInput
                label="Email"
                type="email"
                placeholder="player@arcade.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
              />

              <ArcadeInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
              />

              <div className="pt-4">
                <ArcadeButton
                  type="submit"
                  variant="cyan"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'LOADING...' : 'START GAME'}
                </ArcadeButton>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="font-arcade text-xs text-muted-foreground">
                NEW PLAYER?{' '}
                <Link to="/register" className="text-neon-magenta hover:text-neon-pink transition-colors">
                  CREATE ACCOUNT
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
              <span className="font-pixel text-[0.6rem] text-neon-green">1 PLAYER</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neon-yellow animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span className="font-pixel text-[0.6rem] text-neon-yellow">CREDITS: ∞</span>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center mt-6 font-pixel text-[0.5rem] text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
            © 2024 NEON BEATS ARCADE
          </p>
        </div>
      </div>
    </ArcadeBackground>
  );
};

export default Login;
