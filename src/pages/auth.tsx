/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { authService } from '../lib/api';
import { type User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

type AuthStep = 'login' | 'register' | 'otp' | 'forgot-password';

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBack }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (step === 'login') {
        const res = await authService.login(formData);
        if (res.success) onAuthSuccess(res.user);
      } else if (step === 'register') {
        const res = await authService.register(formData);
        if (res.success) setStep('otp');
      } else if (step === 'otp') {
        const res = await authService.verifyOtp(formData.email, formData.otp);
        if (res.success) setStep('login');
      } else if (step === 'forgot-password') {
        // Handle forgot password logic
        alert('OTP for password reset sent to email');
        setStep('otp');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <button onClick={onBack} className="text-purple-400 hover:text-purple-300 text-sm mb-4">← Back to home</button>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {step === 'login' && 'Welcome Back'}
            {step === 'register' && 'Create Account'}
            {step === 'otp' && 'Verify Email'}
            {step === 'forgot-password' && 'Reset Password'}
          </h2>
          <p className="text-slate-400 mt-2">
            {step === 'login' && "Don't have an account? "}
            {step === 'login' && (
              <button onClick={() => setStep('register')} className="text-purple-400 font-medium hover:underline">Register</button>
            )}
            {step === 'register' && "Already have an account? "}
            {step === 'register' && (
              <button onClick={() => setStep('login')} className="text-purple-400 font-medium hover:underline">Login</button>
            )}
            {step === 'otp' && `We've sent a code to ${formData.email}`}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                <input
                  type="text" name="name" required
                  value={formData.name} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  placeholder="John Doe"
                />
              </div>
            )}

            {(step === 'login' || step === 'register' || step === 'forgot-password') && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                <input
                  type="email" name="email" required
                  value={formData.email} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  placeholder="name@company.com"
                />
              </div>
            )}

            {(step === 'login' || step === 'register') && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-400">Password</label>
                  {step === 'login' && (
                    <button type="button" onClick={() => setStep('forgot-password')} className="text-xs text-indigo-400 hover:underline">Forgot password?</button>
                  )}
                </div>
                <input
                  type="password" name="password" required
                  value={formData.password} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  placeholder="••••••••"
                />
              </div>
            )}

            {step === 'otp' && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Verification Code</label>
                <input
                  type="text" name="otp" required
                  value={formData.otp} onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white text-center tracking-[1em] font-bold"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {loading ? 'Processing...' : (
                step === 'login' ? 'Login' :
                  step === 'register' ? 'Register' :
                    step === 'otp' ? 'Verify' : 'Send Code'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
