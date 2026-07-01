import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Rewards() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('catalog');

  const fetchData = () => {
    Promise.all([
      api.get('/rewards'),
      api.get('/rewards/my-claims'),
    ]).then(([rw, cl]) => {
      setRewards(rw.data.data);
      setClaims(cl.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleClaim = async (reward) => {
    if (!confirm(`Tukar ${reward.pointsRequired} poin untuk "${reward.title}"?`)) return;
    setClaiming(reward.id);
    setMsg('');
    try {
      await api.post(`/rewards/${reward.id}/claim`);
      setMsg('success:' + reward.title);
      await refreshUser();
      fetchData();
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Gagal klaim reward'));
    } finally {
      setClaiming(null);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>🎁 Reward Catalog</h1>
          <p>Tukar poin Anda dengan reward menarik</p>
        </div>
        <div className="points-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
          ⭐ {user?.points || 0} Poin tersedia
        </div>
      </div>

      <div className="page-body">
        {msg.startsWith('success') && (
          <div className="alert alert-success mb-4">✅ Berhasil klaim reward: {msg.replace('success:', '')}! Cek tab Riwayat Klaim.</div>
        )}
        {msg.startsWith('error') && (
          <div className="alert alert-error mb-4">⚠️ {msg.replace('error:', '')}</div>
        )}

        {/* Tabs */}
        <div className="tab-bar">
          {[
            { id: 'catalog', label: '🎁 Katalog Reward' },
            { id: 'history', label: '📋 Riwayat Klaim' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn${tab === t.id ? ' active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'catalog' && (
          rewards.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-icon">🎁</div><h3>Belum ada reward</h3><p>Reward akan segera tersedia</p></div></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {rewards.map(r => {
                const canClaim = (user?.points || 0) >= r.pointsRequired && r.stock > 0;
                const outOfStock = r.stock === 0;
                return (
                  <div
                    key={r.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: outOfStock ? 0.55 : 1,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!outOfStock) {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    {/* Icon area */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(112,0,112,0.07), rgba(255,204,0,0.12))',
                      padding: '1.5rem 1rem 1rem',
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '2.75rem', lineHeight: 1 }}>🎁</div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.125rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>{r.title}</h3>
                      {r.description && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
                          {r.description}
                        </p>
                      )}
                      {!r.description && <div style={{ flex: 1 }} />}

                      {/* Points & stock row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <div className="points-badge" style={{ fontSize: '0.75rem' }}>⭐ {r.pointsRequired} poin</div>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: outOfStock ? 'var(--danger)' : 'var(--success)',
                          background: outOfStock ? 'rgba(217,45,32,0.08)' : 'rgba(22,138,90,0.08)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                        }}>
                          {outOfStock ? 'Habis' : `Stok: ${r.stock}`}
                        </span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                      <button
                        className={`btn w-full ${canClaim ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleClaim(r)}
                        disabled={!canClaim || claiming === r.id}
                        style={{ justifyContent: 'center' }}
                      >
                        {claiming === r.id
                          ? <><div className="spinner" /> Memproses...</>
                          : outOfStock
                            ? '✕ Stok Habis'
                            : !canClaim
                              ? `Kurang ${r.pointsRequired - (user?.points || 0)} poin`
                              : '🎁 Klaim Reward'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'history' && (
          claims.length === 0 ? (
            <div className="card"><div className="empty-state"><div className="empty-icon">📋</div><h3>Belum ada riwayat klaim</h3><p>Klaim reward dari katalog</p></div></div>
          ) : (
            <div className="card">
              <div className="table-container">
                <table>
                  <thead><tr><th>Reward</th><th>Poin</th><th>Status</th><th>Tanggal</th></tr></thead>
                  <tbody>
                    {claims.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.reward.title}</td>
                        <td><div className="points-badge" style={{ fontSize: '0.75rem' }}>⭐ {c.reward.pointsRequired}</div></td>
                        <td><span className={`badge ${c.status === 'PENDING' ? 'badge-pending' : 'badge-approved'}`}>{c.status}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.claimedAt).toLocaleDateString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
