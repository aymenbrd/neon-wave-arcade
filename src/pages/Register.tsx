import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArcadeBackground } from '@/components/arcade/ArcadeBackground';
import { ArcadeButton } from '@/components/arcade/ArcadeButton';
import { ArcadeInput } from '@/components/arcade/ArcadeInput';
import { Mail, Lock, User, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(username, email, password);
      toast.success('Account created! Welcome to the arcade!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-gradient-to-br from-neon-magenta to-neon-purple mb-4 animate-glow-pulse">
              <Gamepad2 size={40} className="text-arcade-black" />
            </div>
            <h1 className="font-pixel text-2xl neon-text-magenta mb-2">JOIN ARCADE</h1>
            <p className="font-arcade text-sm text-muted-foreground">CREATE YOUR ACCOUNT</p>
          </div>

          {/* Register Form */}
          <div className="arcade-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-6">
              <h2 className="font-pixel text-sm neon-text-cyan">
                NEW PLAYER
              </h2>
              <p className="font-arcade text-xs text-muted-foreground mt-2">
                Enter your details to begin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ArcadeInput
                label="Username"
                type="text"
                placeholder="PLAYER_ONE"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User size={18} />}
              />

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

              <ArcadeInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={18} />}
              />

              <div className="pt-4">
                <ArcadeButton
                  type="submit"
                  variant="magenta"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
                </ArcadeButton>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="font-arcade text-xs text-muted-foreground">
                ALREADY A PLAYER?{' '}
                <Link to="/login" className="text-neon-cyan hover:text-neon-blue transition-colors">
                  SIGN IN
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center mt-6 font-pixel text-[0.5rem] text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            © 2024 NEON BEATS ARCADE
          </p>
        </div>
      </div>
    </ArcadeBackground>
  );
};

export default Register;
