'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AuthForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push(user.role === 'admin' ? '/admin' : '/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const u = await login(form.email, form.password);
        if (!u) setError('Invalid email or password. Try again.');
      } else {
        if (!form.name.trim()) { setError('Please enter your name.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
        const u = await register(form.name, form.email, form.password);
        if (!u) setError('An account with this email already exists.');
      }
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div className="orb" style={{ width: 400, height: 400, background: 'var(--accent-cyan)', top: -150, left: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'var(--accent-purple)', bottom: -100, right: -100 }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)', padding: '40px 36px',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>⚡</div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 700, background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              TechServe Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 6 }}>
              {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
            </p>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)',
            padding: 4, marginBottom: 28
          }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }} style={{
                padding: '10px', border: 'none', borderRadius: 'calc(var(--radius-sm) - 2px)',
                background: tab === t ? 'var(--gradient-btn)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.9rem', transition: 'var(--transition)',
                cursor: 'pointer',
              }}>
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>

            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8, padding: '14px' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="spinner" style={{ width: 18, height: 18 }} />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                tab === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          {/* Admin hint */}
          {tab === 'login' && (
            <div style={{
              marginTop: 24, padding: '12px 16px',
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)'
            }}>
              <strong style={{ color: '#a78bfa' }}>Admin Demo:</strong> admin@techserve.edu / Admin@123
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
