export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p style={{ marginBottom: 8 }}>
          <span style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 700 }}>
            TechServe Hub
          </span>
          {' '}— Laptop Repair &amp; 3D Printing Services
        </p>
        <p>Built for students. Powered by passion. 🚀</p>
        <p style={{ marginTop: 12 }}>Admin demo: <code style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>admin@techserve.edu</code> / <code style={{ color: 'var(--accent-cyan)', fontSize: '0.82rem' }}>Admin@123</code></p>
      </div>
    </footer>
  );
}
