'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { printStore } from '@/lib/store';
import { parseSTL, estimateFromFileSize, SliceEstimate } from '@/lib/stl-parser';
import { FilamentType } from '@/lib/types';
import { sendPrintEmail } from '@/lib/email';

const FILAMENTS: { type: FilamentType; desc: string; color: string }[] = [
  { type: 'PLA', desc: 'Easiest to print, great for prototypes', color: '#00d4ff' },
  { type: 'ABS', desc: 'Durable, heat-resistant', color: '#f97316' },
  { type: 'PETG', desc: 'Strong + flexible, food-safe', color: '#22c55e' },
  { type: 'TPU', desc: 'Flexible rubber-like material', color: '#a78bfa' },
];

const COLORS = ['White', 'Black', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Orange'];

export default function PrintPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [estimate, setEstimate] = useState<SliceEstimate | null>(null);
  const [filament, setFilament] = useState<FilamentType>('PLA');
  const [infill, setInfill] = useState(20);
  const [color, setColor] = useState('White');
  const [notes, setNotes] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [submitted, setSubmitted] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setParsing(true);
    setEstimate(null);
    try {
      const buf = await f.arrayBuffer();
      const est = f.name.toLowerCase().endsWith('.stl')
        ? parseSTL(buf, infill)
        : estimateFromFileSize(f.size, infill);
      setEstimate(est);
    } catch {
      setEstimate(estimateFromFileSize(f.size, infill));
    } finally {
      setParsing(false);
    }
  }, [infill]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  // Re-estimate when infill changes
  const handleInfillChange = async (newInfill: number) => {
    setInfill(newInfill);
    if (file) {
      setParsing(true);
      try {
        const buf = await file.arrayBuffer();
        const est = file.name.toLowerCase().endsWith('.stl')
          ? parseSTL(buf, newInfill)
          : estimateFromFileSize(file.size, newInfill);
        setEstimate(est);
      } finally {
        setParsing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !estimate) return;
    const order = printStore.create({
      userId: user?.id || 'guest',
      userName: form.name,
      userEmail: form.email,
      fileName: file.name,
      fileSize: file.size,
      filamentType: filament,
      infillPercent: infill,
      volumeCm3: estimate.volumeCm3,
      estimatedTimeHrs: estimate.estimatedTimeHrs,
      priceInr: estimate.priceInr,
      colorChoice: color,
      notes,
    });
    setSubmitted(true);
    // Send emails in background (non-blocking)
    setSendingEmail(true);
    sendPrintEmail({
      orderId: order.id,
      userName: order.userName,
      userEmail: order.userEmail,
      fileName: order.fileName,
      filamentType: order.filamentType,
      infillPercent: order.infillPercent,
      colorChoice: order.colorChoice,
      volumeCm3: order.volumeCm3,
      estimatedTimeHrs: order.estimatedTimeHrs,
      priceInr: order.priceInr,
      notes: order.notes,
    }).finally(() => setSendingEmail(false));
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="animate-fade-up" style={{ textAlign: 'center', maxWidth: 500 }}>
          <div style={{ fontSize: '5rem', marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>Order Placed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
            Your 3D print order for <strong style={{ color: 'var(--accent-cyan)' }}>{file?.name}</strong> has been submitted.
          </p>
          {sendingEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              Sending confirmation email...
            </div>
          ) : (
            <p style={{ color: 'var(--accent-green)', fontSize: '0.85rem', marginBottom: 16 }}>📧 Confirmation email sent!</p>
          )}
          <div style={{
            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 32, textAlign: 'left'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              💰 <strong style={{ color: 'var(--accent-orange)' }}>Estimated Total: ₹{estimate?.priceInr}</strong>
              &emsp;⏱️ {estimate?.estimatedTimeHrs} hrs print time
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user && <button className="btn btn-primary" onClick={() => router.push('/dashboard')}>Track Order →</button>}
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setFile(null); setEstimate(null); }}>
              New Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🖨️</div>
        <h1 className="section-title">3D Printing Service</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, maxWidth: 500, margin: '8px auto 0' }}>
          Upload your model, get an instant price estimate, and we'll print it for you.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          {['₹5–10 / cm³', '+ ₹50 base fee', 'PLA · ABS · PETG · TPU'].map(t => (
            <span key={t} style={{ fontSize: '0.82rem', color: 'var(--accent-orange)', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: '4px 14px', borderRadius: 50, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* File Upload */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>1. Upload Your File</h3>
              <div
                className={`dropzone${dragging ? ' active' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input ref={inputRef} type="file" accept=".stl,.obj,.3mf" style={{ display: 'none' }} onChange={onFileChange} />
                {file ? (
                  <>
                    <span className="dropzone-icon">📁</span>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>{file.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{(file.size / 1024).toFixed(1)} KB — click to change</p>
                  </>
                ) : (
                  <>
                    <span className="dropzone-icon">📤</span>
                    <p style={{ fontWeight: 600, marginBottom: 8 }}>Drag &amp; drop your file here</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>or click to browse</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>Supports .STL, .OBJ, .3MF</p>
                  </>
                )}
              </div>
              {parsing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                  <span className="spinner" style={{ width: 18, height: 18 }} /> Analyzing file...
                </div>
              )}
            </div>

            {/* Filament */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>2. Choose Filament</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {FILAMENTS.map(f => (
                  <button key={f.type} type="button" onClick={() => setFilament(f.type)} style={{
                    padding: '14px', border: `2px solid ${filament === f.type ? f.color : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)', background: filament === f.type ? `${f.color}18` : 'transparent',
                    textAlign: 'left', transition: 'var(--transition)', cursor: 'pointer'
                  }}>
                    <div style={{ fontWeight: 700, color: filament === f.type ? f.color : 'var(--text-primary)', marginBottom: 4 }}>{f.type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>3. Pick Color</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)} style={{
                    padding: '8px 16px', border: `2px solid ${color === c ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderRadius: 50, background: color === c ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: color === c ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontSize: '0.85rem', fontWeight: 600, transition: 'var(--transition)', cursor: 'pointer'
                  }}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Infill */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>4. Infill Density</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Infill Percentage</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>{infill}%</span>
              </div>
              <input type="range" min={5} max={100} step={5} value={infill} onChange={e => handleInfillChange(Number(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>5% (Draft)</span><span>50% (Standard)</span><span>100% (Solid)</span>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[15, 20, 50].map(v => (
                  <button key={v} type="button" onClick={() => handleInfillChange(v)} style={{
                    padding: '8px', border: `1px solid ${infill === v ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)', background: infill === v ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: infill === v ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', transition: 'var(--transition)'
                  }}>{v}%</button>
                ))}
              </div>
            </div>

            {/* Estimate */}
            <div className="estimate-panel">
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>💰 Price Estimate</h3>
              {!estimate ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 8 }}>📁</p>
                  <p>Upload a file to see your estimate</p>
                </div>
              ) : (
                <>
                  <div className="estimate-row">
                    <span className="estimate-label">Print Volume</span>
                    <span className="estimate-value">{estimate.volumeCm3} cm³</span>
                  </div>
                  <div className="estimate-row">
                    <span className="estimate-label">Estimated Time</span>
                    <span className="estimate-value">{estimate.estimatedTimeHrs} hrs</span>
                  </div>
                  <div className="estimate-row">
                    <span className="estimate-label">Material ({filament})</span>
                    <span className="estimate-value">₹{(estimate.volumeCm3 * 7.5).toFixed(2)}</span>
                  </div>
                  <div className="estimate-row">
                    <span className="estimate-label">Base Service Fee</span>
                    <span className="estimate-value">₹50.00</span>
                  </div>
                  <div className="estimate-row" style={{ borderTop: '1px solid rgba(0,212,255,0.2)', marginTop: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                    <span className="estimate-total">₹{estimate.priceInr}</span>
                  </div>
                </>
              )}
            </div>

            {/* Contact */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>5. Your Details</h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="you@college.edu" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Special Notes (optional)</label>
              <textarea className="form-input form-textarea" style={{ minHeight: 80 }} placeholder="Any special requirements, dimensions, or instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-orange btn-full" style={{ padding: '16px', fontSize: '1rem' }}
              disabled={!file || !estimate || !form.name || !form.email}>
              {file ? `Place Order — ₹${estimate?.priceInr ?? '...'}` : 'Upload a File First'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
