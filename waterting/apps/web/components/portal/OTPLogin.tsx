'use client';

import { useState } from 'react';

export function OTPLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [loading, setLoading] = useState(false);

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
      alert('OTP Sent! Please check your email.');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Buyer Portal Login</h2>
      <p className="text-slate-500 mb-6">Enter your registered email to receive a secure login code.</p>

      {step === 'EMAIL' ? (
        <div className="space-y-4">
          <input 
            type="email"
            placeholder="Email Address" 
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
            onClick={handleRequestOTP} 
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Get OTP'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input 
            type="text"
            placeholder="6-Digit Code" 
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            value={otp} 
            onChange={(e) => setOtp(e.target.value)}
          />
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
            onClick={handleVerifyOTP} 
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
          <button 
             className="w-full text-blue-600 hover:underline text-sm font-medium"
             onClick={() => setStep('EMAIL')}
          >
            Change Email
          </button>
        </div>
      )}
    </div>
  );
}
