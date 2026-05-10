'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          TechServe Hub
        </Link>

        {/* Links */}
        <ul className="navbar-links">
          <li><Link href="/" className={isActive('/')}>Home</Link></li>
          <li><Link href="/services/repair" className={isActive('/services/repair')}>Laptop Repair</Link></li>
          <li><Link href="/services/print" className={isActive('/services/print')}>3D Printing</Link></li>
          {user && (
            <li><Link href="/dashboard" className={isActive('/dashboard')}>Dashboard</Link></li>
          )}
          {user?.role === 'admin' && (
            <li><Link href="/admin" className={isActive('/admin')}>Admin</Link></li>
          )}
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <div className="navbar-user">
                <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span>{user.name}</span>
                {user.role === 'admin' && (
                  <span style={{
                    fontSize: '0.7rem', background: 'rgba(124,58,237,0.2)',
                    color: '#a78bfa', padding: '2px 8px', borderRadius: '50px', fontWeight: 600
                  }}>ADMIN</span>
                )}
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn btn-secondary btn-sm">Login</Link>
              <Link href="/auth?tab=register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Home</Link>
          <Link href="/services/repair" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Laptop Repair</Link>
          <Link href="/services/print" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>3D Printing</Link>
          {user && <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Dashboard</Link>}
          {user?.role === 'admin' && <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ padding: '10px 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Admin</Link>}
          {user ? (
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>Logout</button>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link href="/auth" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/auth?tab=register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
