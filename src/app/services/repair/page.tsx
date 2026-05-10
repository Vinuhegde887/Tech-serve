'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { repairStore } from '@/lib/store';
import { sendRepairEmail } from '@/lib/email';

const deviceTypes = ['Laptop', 'Desktop PC', 'MacBook', 'Tablet', 'All-in-One'];
const issueTypes = [
  'Screen / Display Issue',
  'Battery Not Charging',
  'Slow Performance',
  'Virus / Malware',
  'OS Reinstall',
  'Keyboard / Touchpad',
  'Speaker / Audio',
  'RAM / SSD Upgrade',
  'Water Damage',
  'Overheating',
  'Won\'t Turn On',
  'Other',
];

export default function RepairPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    deviceType: '',
    brand: '',
    issueType: '',
    issueDescription: '',
    preferredDate: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const req = repairStore.create({
      userId: user?.id || 'guest',
      userName: form.name,
      userEmail: form.email,
      deviceType: form.deviceType,
      brand: form.brand,
      issueType: form.issueType,
      issueDescription: form.issueDescription,
      preferredDate: form.preferredDate,
    });
    setSubmitted(true);
    // Send emails in background (non-blocking)
    setSendingEmail(true);
    sendRepairEmail({
      requestId: req.id,
      userName: req.userName,
      userEmail: req.userEmail,
      deviceType: req.deviceType,
      brand: req.brand,
      issueType: req.issueType,
      issueDescription: req.issueDescription,
      preferredDate: req.preferredDate,
    }).finally(() => setSendingEmail(false));
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="animate-fade-up" style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '5rem', marginBottom: 20 }}>✅</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>Request Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
            Your repair request has been received. We'll review it and get back to you within 24 hours at <strong style={{ color: 'var(--accent-cyan)' }}>{form.email}</strong>.
          </p>
          {sendingEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              Sending confirmation email...
            </div>
          ) : (
            <p style={{ color: 'var(--accent-green)', fontSize: '0.85rem', marginBottom: 24 }}>📧 Confirmation email sent!</p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user && (
              <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>View Dashboard →</button>
            )}
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setStep(1); setForm({ name: user?.name || '', email: user?.email || '', deviceType: '', brand: '', issueType: '', issueDescription: '', preferredDate: '' }); }}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 24px', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔧</div>
        <h1 className="section-title">Laptop &amp; System Repair</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Fill in the details below and we'll take care of the rest.
        </p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= s ? 'var(--gradient-btn)' : 'rgba(255,255,255,0.06)',
              border: `2px solid ${step >= s ? 'transparent' : 'var(--border-subtle)'}`,
              fontWeight: 700, fontSize: '0.9rem', transition: 'var(--transition)',
              flexShrink: 0, zIndex: 1
            }}>{s}</div>
            {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--accent-cyan)' : 'var(--border-subtle)', transition: 'var(--transition)' }} />}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: -28, marginBottom: 40, paddingLeft: 0 }}>
        {['Your Info', 'Device Details', 'Issue Description'].map((l) => (
          <span key={l} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flex: 1, textAlign: 'center' }}>{l}</span>
        ))}
      </div>

      {/* Form Card */}
      <div className="card" style={{ padding: '36px' }}>
        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: '1.1rem' }}>Your Contact Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Service Date</label>
                <input className="form-input" type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <button type="button" className="btn btn-primary btn-full" style={{ marginTop: 8 }}
                onClick={() => { if (!form.name || !form.email) return; setStep(2); }}>
                Next: Device Details →
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: '1.1rem' }}>Device Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Device Type *</label>
                  <select className="form-input form-select" value={form.deviceType} onChange={e => set('deviceType', e.target.value)} required>
                    <option value="">Select device</option>
                    {deviceTypes.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand / Model</label>
                  <input className="form-input" placeholder="e.g. Dell XPS 15" value={form.brand} onChange={e => set('brand', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Issue Type *</label>
                <select className="form-input form-select" value={form.issueType} onChange={e => set('issueType', e.target.value)} required>
                  <option value="">Select issue</option>
                  {issueTypes.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }}
                  onClick={() => { if (!form.deviceType || !form.issueType) return; setStep(3); }}>
                  Next: Describe Issue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ fontWeight: 700, marginBottom: 24, fontSize: '1.1rem' }}>Describe Your Issue</h3>
              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea className="form-input form-textarea" placeholder="Describe your problem in detail. When did it start? What were you doing? Any error messages?" value={form.issueDescription} onChange={e => set('issueDescription', e.target.value)} required style={{ minHeight: 140 }} />
              </div>

              {/* Summary */}
              <div style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 10 }}>📋 Request Summary</p>
                {[['Name', form.name], ['Email', form.email], ['Device', `${form.deviceType}${form.brand ? ' — ' + form.brand : ''}`], ['Issue', form.issueType]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 8, fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: 60 }}>{k}:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
                  disabled={!form.issueDescription}>
                  Submit Repair Request ✓
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
