import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AuthLayout } from '../components/auth.components';
import { useAuth } from '../context/auth.context';
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import axios from 'axios';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setIsLoading(true);
try{
await axios.post("https://api.synccode.dev/auth/verify-email", {
  email,
  otp,
}, { withCredentials: true });
      toast({
        title: 'Account verified!',
        description: 'Your account has been successfully verified.',
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Verification failed',
        description: 'Invalid OTP. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We've sent a 6-digit code to ${email || 'your email'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button 
          type="submit" 
          variant="hero" 
          className="w-full" 
          size="lg" 
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </Button>

        <p className="text-center text-muted-foreground">
          Didn't receive the code?{' '}
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => {
              toast({
                title: 'Code resent!',
                description: 'A new verification code has been sent.',
              });
            }}
          >
            Resend
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}