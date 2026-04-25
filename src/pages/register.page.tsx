import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth.components';
import { Loader2, User, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { authService } from '../lib/authService';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;

  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.register({ name, email, password });
      toast({
        title: 'Verification email sent!',
        description: 'Please check your inbox and enter the OTP.',
      });
      navigate('/verify-otp', { state: { email } });
    } catch {
      toast({
        title: 'Registration failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    base: "w-full py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 bg-background/50 border border-border/50 focus:border-primary focus:ring-[3px] focus:ring-primary/10",
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join SyncCode and start collaborating today"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground block">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`${inputStyle.base} pl-10 pr-4`}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`${inputStyle.base} pl-10 pr-4`}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={`${inputStyle.base} pl-10 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: i <= passwordStrength ? strengthColors[passwordStrength] : 'rgba(255,255,255,0.08)'
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-medium" style={{ color: strengthColors[passwordStrength] }}>
                {strengthLabels[passwordStrength]}
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl font-bold text-primary-foreground text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-[0_4px_16px_rgba(99,102,241,0.3)] bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : (
            'Create Account →'
          )}
        </button>

        {/* Terms note */}
        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          By signing up you agree to our{' '}
          <span className="text-primary cursor-pointer hover:underline">Terms</span>{' '}
          &{' '}
          <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}