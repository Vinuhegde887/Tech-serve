import Link from 'next/link';

const steps = [
  { icon: '📋', title: 'Submit Request', desc: 'Fill out a quick form describing your issue or upload your 3D file.' },
  { icon: '⚙️', title: 'We Process It', desc: 'Our team reviews your request and prepares your order.' },
  { icon: '✅', title: 'Pick Up & Go', desc: 'Get your repaired device or freshly printed part on time.' },
];

const features = [
  { icon: '⚡', title: 'Fast Turnaround', desc: 'Most repairs done within 24–48 hours.' },
  { icon: '💰', title: 'Student Pricing', desc: 'Affordable rates designed for college budgets.' },
  { icon: '🔒', title: 'Guaranteed Quality', desc: 'All services come with a satisfaction guarantee.' },
  { icon: '📍', title: 'On-Campus', desc: 'No need to leave campus — we\'re right here.' },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 0 80px' }}>
        {/* Decorative orbs */}
        <div className="orb" style={{ width: 500, height: 500, background: 'var(--accent-cyan)', top: -150, left: -150 }} />
        <div className="orb" style={{ width: 400, height: 400, background: 'var(--accent-purple)', bottom: -100, right: -100 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 50, padding: '6px 18px', marginBottom: 28,
            fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)'
          }}>
            🎓 Built for Students & Makers
          </div>

          <h1 className="section-title animate-fade-up delay-100" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: 24 }}>
            Your Campus
            <br />
            <span className="gradient-text">Tech & Print Hub</span>
          </h1>

          <p className="animate-fade-up delay-200" style={{
            fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 560,
            margin: '0 auto 40px', lineHeight: 1.8
          }}>
            Get your laptop repaired by experts or bring your 3D designs to life — all in one place, right on campus.
          </p>

          <div className="animate-fade-up delay-300" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/services/repair" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              🔧 Repair My Device
            </Link>
            <Link href="/services/print" className="btn btn-orange" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              🖨️ Start 3D Printing
            </Link>
          </div>

          {/* Floating stats */}
          <div className="animate-fade-up delay-400" style={{
            display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 64
          }}>
            {[
              { num: '500+', label: 'Devices Repaired' },
              { num: '1200+', label: '3D Parts Printed' },
              { num: '98%', label: 'Satisfaction Rate' },
              { num: '24h', label: 'Avg. Turnaround' },
            ].map((s) => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '16px 28px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.num}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">Our Services</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Two powerful services designed to keep you building without interruptions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
            {/* Repair Card */}
            <div className="card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div className="orb" style={{ width: 200, height: 200, background: 'var(--accent-cyan)', top: -60, right: -60, opacity: 0.15 }} />
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>🔧</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                Laptop &amp; System Repair
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                Hardware fixes, software reinstalls, virus removal, battery replacement, screen repair and more. Drop it off and we handle the rest.
              </p>
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28, listStyle: 'none' }}>
                {['Screen Repair', 'Battery', 'Virus Removal', 'RAM/SSD Upgrade', 'OS Install'].map(t => (
                  <li key={t} style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 600, padding: '4px 12px', borderRadius: 50, border: '1px solid rgba(0,212,255,0.15)' }}>{t}</li>
                ))}
              </ul>
              <Link href="/services/repair" className="btn btn-primary">Book Repair →</Link>
            </div>

            {/* 3D Print Card */}
            <div className="card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div className="orb" style={{ width: 200, height: 200, background: 'var(--accent-orange)', top: -60, right: -60, opacity: 0.15 }} />
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>🖨️</div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>
                3D Printing Service
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                Upload your STL file, get an instant cost estimate based on volume and infill, pick your filament and color — we print it for you.
              </p>
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28, listStyle: 'none' }}>
                {['PLA / ABS / PETG', 'Instant Estimate', 'Custom Colors', 'Any Infill %', 'Status Tracking'].map(t => (
                  <li key={t} style={{ background: 'rgba(249,115,22,0.08)', color: 'var(--accent-orange)', fontSize: '0.78rem', fontWeight: 600, padding: '4px 12px', borderRadius: 50, border: '1px solid rgba(249,115,22,0.15)' }}>{t}</li>
                ))}
              </ul>
              <Link href="/services/print" className="btn btn-orange">Start Printing →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─── */}
      <section className="section" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Simple three-step process to get your service done.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {steps.map((s, i) => (
              <div key={s.title} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--gradient-card)', border: '2px solid var(--border-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', margin: '0 auto 20px', position: 'relative'
                }}>
                  {s.icon}
                  <span style={{
                    position: 'absolute', top: -8, right: -8, width: 24, height: 24,
                    background: 'var(--gradient-btn)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800, color: '#fff'
                  }}>{i + 1}</span>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">Why Choose Us?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {features.map((f) => (
              <div key={f.title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─── */}
      <section className="section" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: 600, height: 300, background: 'var(--accent-purple)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.12 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: '1.05rem' }}>
            Create a free account to track your orders and get faster service.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth?tab=register" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
              Create Free Account
            </Link>
            <Link href="/services/repair" className="btn btn-secondary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
