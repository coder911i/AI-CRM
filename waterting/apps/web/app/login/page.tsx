'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Technical Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-[var(--border)] rounded-full" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-[var(--border)] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border)] p-10 shadow-[8px_8px_0px_0px_var(--border)]">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-[var(--accent)] bg-[var(--accent-light)] mb-6">
              <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-[0.2em] uppercase mb-2 italic">Waterting</h1>
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest italic border-t border-[var(--border)] pt-2 inline-block">Real Estate Intelligence Core v1.0</p>
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
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                 Identification Hash
              </label>
              <input
                id="login-email"
                type="email"
                className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-5 py-4 text-[14px] font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)] transition-all uppercase placeholder:text-[var(--text-muted)] italic"
                placeholder="USER@DOMAIN.TLD"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-[var(--border)]" />
                 Access Credential
              </label>
              <input
                id="login-password"
                type="password"
                className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border)] text-[var(--text-primary)] px-5 py-4 text-[14px] font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)] transition-all placeholder:text-[var(--text-muted)]"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] border-2 border-[var(--accent)] text-white font-black py-5 text-[12px] tracking-[0.3em] uppercase hover:bg-white hover:text-[var(--accent)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[4px_4px_0px_0px_var(--accent-light)] active:translate-x-1 active:translate-y-1 active:shadow-none italic"
            >
              {loading ? 'SYNCHRONIZING...' : 'INITIALIZE ACCESS'}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-[var(--border)] pt-8">
            <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">
              Unregistered entity?{' '}
              <Link href="/signup" className="text-[var(--accent)] hover:underline decoration-2 underline-offset-4">
                Register Protocol
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between px-2">
           <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">System: Operational</div>
           <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Secure Uplink: Active</div>
        </div>
      </div>
    </div>
  );
}
