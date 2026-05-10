'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { repairStore, printStore } from '@/lib/store';
import { RepairRequest, PrintOrder } from '@/lib/types';

const REPAIR_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'] as const;
const PRINT_STATUSES = ['pending', 'approved', 'printing', 'completed', 'cancelled'] as const;

const statusBadge = (status: string) => (
  <span className={`badge badge-${status}`}>● {status.replace('-', ' ')}</span>
);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'repair' | 'print'>('overview');
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [prints, setPrints] = useState<PrintOrder[]>([]);
  const [editingRepair, setEditingRepair] = useState<RepairRequest | null>(null);
  const [editingPrint, setEditingPrint] = useState<PrintOrder | null>(null);

  const load = useCallback(() => {
    setRepairs(repairStore.getAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setPrints(printStore.getAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) { router.push('/auth'); return; }
    load();
  }, [user, loading, router, load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;
  if (!user || user.role !== 'admin') return null;

  const totalRevenue = prints.filter(p => p.status === 'completed').reduce((s, p) => s + p.priceInr, 0);

  const stats = [
    { icon: '🔧', label: 'Total Repairs', num: repairs.length, color: '#00d4ff', bg: 'rgba(0,212,255,0.1)' },
    { icon: '🖨️', label: 'Total Prints', num: prints.length, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { icon: '⏳', label: 'Pending', num: repairs.filter(r => r.status === 'pending').length + prints.filter(p => p.status === 'pending').length, color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
    { icon: '💰', label: 'Revenue (₹)', num: totalRevenue.toFixed(0), color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  ];

  const saveRepair = () => {
    if (!editingRepair) return;
    repairStore.update(editingRepair.id, { status: editingRepair.status, adminNotes: editingRepair.adminNotes });
    setEditingRepair(null); load();
  };

  const savePrint = () => {
    if (!editingPrint) return;
    printStore.update(editingPrint.id, { status: editingPrint.status, adminNotes: editingPrint.adminNotes });
    setEditingPrint(null); load();
  };

  return (
    <div style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{ padding: '6px 16px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 50, fontSize: '0.8rem', fontWeight: 700, color: '#a78bfa' }}>
            🛡️ ADMIN PANEL
          </div>
        </div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Service Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage all repair requests and 3D print orders.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 36 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span>{s.icon}</span></div>
            <div>
              <div className="stat-number" style={{ color: s.color }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', padding: 4, marginBottom: 28, width: 'fit-content' }}>
        {(['overview', 'repair', 'print'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 22px', border: 'none', borderRadius: 'calc(var(--radius-sm) - 2px)',
            background: tab === t ? 'var(--gradient-btn)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)', fontWeight: 600,
            fontSize: '0.88rem', cursor: 'pointer', transition: 'var(--transition)'
          }}>
            {t === 'overview' ? '📊 Overview' : t === 'repair' ? '🔧 Repairs' : '🖨️ Prints'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Recent Repairs */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Recent Repair Requests</h3>
            {repairs.slice(0, 5).map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.userName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.deviceType} — {r.issueType}</div>
                </div>
                {statusBadge(r.status)}
              </div>
            ))}
            {repairs.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No requests yet</p>}
            <button onClick={() => setTab('repair')} className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>View All →</button>
          </div>

          {/* Recent Prints */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Recent Print Orders</h3>
            {prints.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.userName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.fileName} — {p.filamentType}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {statusBadge(p.status)}
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-orange)', fontWeight: 700, marginTop: 4 }}>₹{p.priceInr}</div>
                </div>
              </div>
            ))}
            {prints.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>}
            <button onClick={() => setTab('print')} className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>View All →</button>
          </div>
        </div>
      )}

      {/* ── REPAIRS ── */}
      {tab === 'repair' && (
        <div className="animate-fade-in">
          {repairs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No repair requests yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Date</th><th>User</th><th>Device</th><th>Issue</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {repairs.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.userName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.userEmail}</div>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{r.deviceType}{r.brand ? ` – ${r.brand}` : ''}</td>
                      <td style={{ fontSize: '0.88rem', maxWidth: 200 }}>
                        <div>{r.issueType}</div>
                        {r.issueDescription && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{r.issueDescription}</div>}
                      </td>
                      <td>{statusBadge(r.status)}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 160 }}>{r.adminNotes || '—'}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingRepair({ ...r })}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PRINTS ── */}
      {tab === 'print' && (
        <div className="animate-fade-in">
          {prints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No print orders yet.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Date</th><th>User</th><th>File</th><th>Specs</th><th>Price</th><th>Status</th><th>Notes</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {prints.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.userName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.userEmail}</div>
                      </td>
                      <td style={{ fontSize: '0.88rem', maxWidth: 160 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.fileName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.colorChoice}</div>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        <div>{p.filamentType} · {p.infillPercent}%</div>
                        <div style={{ color: 'var(--text-muted)' }}>{p.volumeCm3} cm³ · {p.estimatedTimeHrs}h</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>₹{p.priceInr}</td>
                      <td>{statusBadge(p.status)}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 160 }}>{p.adminNotes || '—'}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingPrint({ ...p })}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Repair Modal ── */}
      {editingRepair && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setEditingRepair(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '36px', maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Edit Repair Request</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>{editingRepair.userName} — {editingRepair.deviceType}</p>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input form-select" value={editingRepair.status} onChange={e => setEditingRepair(r => r ? { ...r, status: e.target.value as typeof REPAIR_STATUSES[number] } : null)}>
                {REPAIR_STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Notes</label>
              <textarea className="form-input form-textarea" style={{ minHeight: 90 }} placeholder="Add notes for the user..." value={editingRepair.adminNotes} onChange={e => setEditingRepair(r => r ? { ...r, adminNotes: e.target.value } : null)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setEditingRepair(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveRepair}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Print Modal ── */}
      {editingPrint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setEditingPrint(null)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '36px', maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Edit Print Order</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>{editingPrint.userName} — {editingPrint.fileName}</p>
            <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 20, fontSize: '0.85rem' }}>
              💰 Price: <strong style={{ color: 'var(--accent-orange)' }}>₹{editingPrint.priceInr}</strong>
              &emsp; ⏱️ {editingPrint.estimatedTimeHrs}h &emsp; {editingPrint.filamentType} · {editingPrint.infillPercent}%
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input form-select" value={editingPrint.status} onChange={e => setEditingPrint(p => p ? { ...p, status: e.target.value as typeof PRINT_STATUSES[number] } : null)}>
                {PRINT_STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Notes</label>
              <textarea className="form-input form-textarea" style={{ minHeight: 90 }} placeholder="e.g. Ready for pickup, Est. 3hrs..." value={editingPrint.adminNotes} onChange={e => setEditingPrint(p => p ? { ...p, adminNotes: e.target.value } : null)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setEditingPrint(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={savePrint}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
