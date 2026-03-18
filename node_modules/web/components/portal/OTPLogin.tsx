'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';

export function OTPLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Email not found in bookings');
      setStep('OTP');
      toast({ title: 'OTP Sent', description: 'Please check your email.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
     setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      
      localStorage.setItem('portal_token', data.token);
      localStorage.setItem('bookingId', data.bookingId);
      window.location.href = '/portal/dashboard';
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Buyer Portal Login</h2>
      <p className="text-slate-500 mb-6">Enter your registered email to receive a secure login code.</p>

      {step === 'EMAIL' ? (
        <div className="space-y-4">
          <Input 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button className="w-full" onClick={handleRequestOTP} disabled={loading}>
            {loading ? 'Sending...' : 'Get OTP'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input 
            placeholder="6-Digit Code" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button className="w-full" onClick={handleVerifyOTP} disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep('EMAIL')}>
            Change Email
          </Button>
        </div>
      )}
    </div>
  );
}
