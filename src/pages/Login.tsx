import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArcadeBackground } from '@/components/arcade/ArcadeBackground';
import { ArcadeButton } from '@/components/arcade/ArcadeButton';
import { ArcadeInput } from '@/components/arcade/ArcadeInput';
import { Mail, Lock, AudioWaveform } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
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
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid credentials. Try again!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ArcadeBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-magenta mb-4">
              <AudioWaveform size={32} className="text-arcade-black" />
            </div>
            <h1 className="font-arcade text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent mb-2">
              NEON BEATS
            </h1>
            <p className="font-arcade text-sm text-muted-foreground">Audio Visualizer</p>
          </div>

          {/* Login Form */}
          <div className="arcade-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-6">
              <h2 className="font-arcade text-lg font-semibold text-foreground">
                Sign In
              </h2>
              <p className="font-arcade text-xs text-muted-foreground mt-1">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ArcadeInput
                label="Email"
                type="email"
                placeholder="you@example.com"
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
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </ArcadeButton>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="font-arcade text-xs text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-neon-magenta hover:text-neon-pink transition-colors font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center mt-6 font-arcade text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            © 2024 Neon Beats
          </p>
        </div>
      </div>
    </ArcadeBackground>
  );
};

export default Login;
