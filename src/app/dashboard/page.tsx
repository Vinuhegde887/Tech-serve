'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { repairStore, printStore } from '@/lib/store';
import { RepairRequest, PrintOrder, RepairStatus, PrintStatus } from '@/lib/types';
import Link from 'next/link';

const statusBadge = (status: string) => {
  const cls = status.replace('-', '-');
  return <span className={`badge badge-${cls}`}>● {status.replace('-', ' ')}</span>;
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [prints, setPrints] = useState<PrintOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'repair' | 'print'>('repair');

  const load = useCallback(() => {
    if (!user) return;
    setRepairs(repairStore.getByUser(user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setPrints(printStore.getByUser(user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [user]);

  useEffect(() => {
    if (!loading && !user) { router.push('/auth'); return; }
    load();
  }, [user, loading, router, load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!user) return null;

  const stats = [
    { icon: '🔧', label: 'Repair Requests', num: repairs.length, color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    { icon: '🖨️', label: 'Print Orders', num: prints.length, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { icon: '✅', label: 'Completed', num: repairs.filter(r => r.status === 'completed').length + prints.filter(p => p.status === 'completed').length, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { icon: '⏳', label: 'Pending', num: repairs.filter(r => r.status === 'pending').length + prints.filter(p => p.status === 'pending').length, color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  ];

  return (
    <div style={{ padding: '48px 24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track your repair requests and 3D print orders.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/services/repair" className="btn btn-secondary btn-sm">+ Repair Request</Link>
            <Link href="/services/print" className="btn btn-orange btn-sm">+ 3D Print Order</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 40 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span>{s.icon}</span>
            </div>
            <div>
              <div className="stat-number" style={{ color: s.color }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 28, width: 'fit-content' }}>
        {(['repair', 'print'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '10px 24px', border: 'none', borderRadius: 'calc(var(--radius-sm) - 2px)',
            background: activeTab === t ? (t === 'repair' ? 'var(--gradient-btn)' : 'var(--gradient-btn-orange)') : 'transparent',
            color: activeTab === t ? '#fff' : 'var(--text-secondary)', fontWeight: 600,
            fontSize: '0.9rem', cursor: 'pointer', transition: 'var(--transition)'
          }}>
            {t === 'repair' ? '🔧 Repair Requests' : '🖨️ Print Orders'}
          </button>
        ))}
      </div>

      {/* Repair Table */}
      {activeTab === 'repair' && (
        <div className="animate-fade-in">
          {repairs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 12 }}>🔧</p>
              <p style={{ marginBottom: 20 }}>No repair requests yet.</p>
              <Link href="/services/repair" className="btn btn-primary">Book Your First Repair</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Device</th><th>Issue</th><th>Status</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map(r => (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.deviceType}</div>
                        {r.brand && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.brand}</div>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.issueType}</div>
                        {r.issueDescription && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.issueDescription}</div>}
                      </td>
                      <td>{statusBadge(r.status)}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 180 }}>{r.adminNotes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Print Table */}
      {activeTab === 'print' && (
        <div className="animate-fade-in">
          {prints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '3rem', marginBottom: 12 }}>🖨️</p>
              <p style={{ marginBottom: 20 }}>No print orders yet.</p>
              <Link href="/services/print" className="btn btn-orange">Start Your First Print</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>File</th><th>Specs</th><th>Price</th><th>Status</th><th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {prints.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</td>
                      <td>
                        <div style={{ fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.fileName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.colorChoice}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{p.filamentType} · {p.infillPercent}% infill</div>
                        <div style={{ color: 'var(--text-muted)' }}>{p.volumeCm3} cm³ · {p.estimatedTimeHrs}h</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>₹{p.priceInr}</td>
                      <td>{statusBadge(p.status)}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 180 }}>{p.adminNotes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
