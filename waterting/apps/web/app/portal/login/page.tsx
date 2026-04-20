'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.publicPost('/portal/auth/request-otp', { email });
      setStep('otp');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.publicPost<{ access_token: string }>('/portal/auth/verify-otp', { email, otp });
      localStorage.setItem('waterting_portal_token', res.access_token);
      localStorage.setItem('waterting_portal_email', email);
      router.push('/portal/chat');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Buyer Portal</h1>
        <p className="subtitle">{step === 'email' ? 'Enter your email to receive an OTP' : 'Enter the OTP sent to your email'}</p>
        {error && <div className="badge badge-danger" style={{marginBottom: 16, display: 'block', textAlign: 'center', padding: '8px'}}>{error}</div>}

        {step === 'email' ? (
          <form onSubmit={requestOtp}>
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <div className="form-group"><label className="form-label">OTP</label><input className="form-input" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required /></div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
