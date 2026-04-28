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
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Technical Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-[var(--border)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border)] p-10 shadow-[8px_8px_0px_0px_var(--border)]">
          <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-[var(--accent)] bg-[var(--accent-light)] mb-6">
                <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
             </div>
             <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-[0.2em] italic mb-1">Entity Registration</h1>
             <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest italic">Protocol Step {step} of 3 — {step === 1 ? 'IDENTITY_VERIFICATION' : step === 2 ? 'TENANT_PROVISIONING' : 'SECURITY_ENCRYPTION'}</p>
          </div>

          <div className="flex gap-2 mb-10">
            {[1,2,3].map(s => (
              <div key={s} className={`flex-1 h-2 border border-[var(--border)] ${s <= step ? 'bg-[var(--accent)]' : 'bg-[var(--bg-elevated)]'}`} />
            ))}
          </div>

          {error && (
            <div className="mb-8 bg-[var(--danger-bg)] border-2 border-[var(--danger)] p-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-[var(--danger)] animate-pulse" />
              <div className="text-[var(--danger)] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Auth Error: {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                     Full Name
                  </label>
                  <input id="signup-name" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-5 py-4 text-[13px] font-bold focus:outline-none focus:border-[var(--accent)] transition-all uppercase placeholder:text-[var(--text-muted)] italic" placeholder="ENTITY_NAME" value={formData.name} onChange={e => update('name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                     Work Email
                  </label>
                  <input id="signup-email" type="email" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-5 py-4 text-[13px] font-bold focus:outline-none focus:border-[var(--accent)] transition-all uppercase placeholder:text-[var(--text-muted)] italic" placeholder="USER@DOMAIN.TLD" value={formData.email} onChange={e => update('email', e.target.value)} required />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                   Organization Identity
                </label>
                <input id="signup-tenant" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-5 py-4 text-[13px] font-bold focus:outline-none focus:border-[var(--accent)] transition-all uppercase placeholder:text-[var(--text-muted)] italic" placeholder="TENANT_NAME" value={formData.tenantName} onChange={e => update('tenantName', e.target.value)} required />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-2">
                <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                   Access Credential
                </label>
                <input id="signup-password" type="password" className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-5 py-4 text-[13px] font-bold focus:outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]" placeholder="••••••••" value={formData.password} onChange={e => update('password', e.target.value)} required minLength={6} />
              </div>
            )}
            
            <button id="signup-submit" type="submit" className="w-full bg-[var(--accent)] border-2 border-[var(--accent)] text-white font-black py-5 text-[11px] tracking-[0.2em] uppercase hover:bg-white hover:text-[var(--accent)] transition-all disabled:opacity-50 shadow-[4px_4px_0px_0px_var(--accent-light)] active:translate-x-1 active:translate-y-1 active:shadow-none italic" disabled={loading}>
              {step < 3 ? 'Proceed to Next Phase' : loading ? 'Finalizing Encryption...' : 'Initialize Registry'}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-[var(--border)] pt-8">
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
              Existing entity identity?{' '}
              <Link href="/login" className="text-[var(--accent)] hover:underline decoration-2 underline-offset-4">
                Access Gateway
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-10 flex items-center justify-between px-2">
           <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Protocol: Secure</div>
           <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Registry: Monitoring</div>
        </div>
      </div>
    </div>
  );
}
