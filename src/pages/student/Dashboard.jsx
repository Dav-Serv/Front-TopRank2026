import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/profile/me'),
      api.get('/opportunities'),
    ]).then(([profileRes, oppRes]) => {
      setStats(profileRes.data.data);
      setOpportunities(oppRes.data.data?.slice(0, 3) || []);
    }).finally(() => setLoading(false));
    refreshUser();
  }, [refreshUser]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
        <p>Memuat dashboard...</p>
      </div>
    );
  }

  const approvedSkills = stats?.skills?.length || 0;
  const approvedCerts = stats?.certificates?.length || 0;
  const approvedPortfolios = stats?.portfolios?.length || 0;
  const badges = stats?.badges || [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Selamat datang, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Pantau perkembangan profil talenta Anda</p>
        </div>
        <div className="points-badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
          ⭐ {user?.points || 0} Poin
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total Poin', value: user?.points || 0, icon: '⭐', color: 'var(--accent-strong)', bg: 'rgba(255,172,0,0.12)' },
            { label: 'Skill Terverifikasi', value: approvedSkills, icon: '⚡', color: 'var(--primary)', bg: 'rgba(112,0,112,0.08)' },
            { label: 'Sertifikat', value: approvedCerts, icon: '📜', color: 'var(--primary-dark)', bg: 'rgba(74,27,157,0.1)' },
            { label: 'Portfolio', value: approvedPortfolios, icon: '💼', color: 'var(--success)', bg: 'rgba(22,138,90,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Badges */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">🏅 Badges Saya</h2>
            {badges.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {badges.map(ub => (
                  <div key={ub.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.875rem', background: 'rgba(112,0,112,0.08)',
                    borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)',
                    border: '1px solid rgba(112,0,112,0.15)'
                  }}>
                    🏅 {ub.badge.title}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏅</div>
                <p style={{ fontSize: '0.875rem' }}>Belum ada badge. Mulai lengkapi profil Anda!</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">⚡ Aksi Cepat</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { to: '/skills', label: '+ Tambah Skill', color: 'var(--primary)', bg: 'rgba(112,0,112,0.07)' },
                { to: '/certificates', label: '+ Upload Sertifikat', color: 'var(--primary-dark)', bg: 'rgba(74,27,157,0.07)' },
                { to: '/portfolios', label: '+ Tambah Portfolio', color: 'var(--success)', bg: 'rgba(22,138,90,0.08)' },
                { to: '/rewards', label: '🎁 Lihat Reward', color: '#8a4000', bg: 'rgba(255,172,0,0.15)' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{
                  padding: '0.625rem 1rem',
                  background: a.bg, color: a.color,
                  borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem',
                  textDecoration: 'none', display: 'block',
                  transition: 'opacity 0.15s'
                }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div className="card p-6" style={{ marginTop: '1.5rem' }}>
            <h2 className="text-lg font-semibold mb-4">💼 Peluang Terbaru</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {opportunities.map(opp => (
                <div key={opp.id} style={{
                  padding: '1rem', background: '#fdf9ff', borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{opp.title}</h3>
                    <span className="badge badge-primary">{opp.type}</span>
                  </div>
                  {opp.company && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>🏢 {opp.company}</p>}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opp.description.slice(0, 100)}...</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {opp.tags?.map(t => (
                      <span key={t} style={{ fontSize: '0.7rem', background: 'rgba(255,172,0,0.15)', color: '#6b3b00', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
