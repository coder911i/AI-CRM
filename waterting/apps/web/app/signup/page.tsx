'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', tenantName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    setError('');
    setLoading(true);
    try {
      await register(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Get Started</h1>
        <p className="subtitle">Step {step} of 3 — {step === 1 ? 'Your Info' : step === 2 ? 'Company' : 'Password'}</p>
        <div style={{display: 'flex', gap: 4, marginBottom: 24}}>
          {[1,2,3].map(s => (
            <div key={s} style={{flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'var(--primary)' : 'var(--border)'}} />
          ))}
        </div>

        {error && <div className="badge badge-danger" style={{marginBottom: 16, display: 'block', textAlign: 'center', padding: '8px 12px'}}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="signup-name" className="form-input" placeholder="John Doe" value={formData.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input id="signup-email" type="email" className="form-input" placeholder="you@company.com" value={formData.email} onChange={e => update('email', e.target.value)} required />
              </div>
            </>
          )}
          {step === 2 && (
            <div className="form-group">
              <label className="form-label">Company / Organization Name</label>
              <input id="signup-tenant" className="form-input" placeholder="Acme Realty" value={formData.tenantName} onChange={e => update('tenantName', e.target.value)} required />
            </div>
          )}
          {step === 3 && (
            <div className="form-group">
              <label className="form-label">Create Password</label>
              <input id="signup-password" type="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={e => update('password', e.target.value)} required minLength={6} />
            </div>
          )}
          <button id="signup-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {step < 3 ? 'Continue' : loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
