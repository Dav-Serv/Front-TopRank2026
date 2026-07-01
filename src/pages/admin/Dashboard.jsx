import { useEffect, useState } from 'react';
import api from '../../api/axios';
import UserAvatar from '../../components/UserAvatar';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>📊 Admin Dashboard</h1>
          <p>Overview platform University Talent Hub</p>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          {[
            { label: 'Total Mahasiswa', value: stats?.totalStudents, icon: '👥', color: 'var(--primary)', bg: 'rgba(112,0,112,0.08)' },
            { label: 'Skill Terverifikasi', value: stats?.totalSkills, icon: '⚡', color: 'var(--primary-dark)', bg: 'rgba(74,27,157,0.09)' },
            { label: 'Sertifikat', value: stats?.totalCertificates, icon: '📜', color: 'var(--success)', bg: 'rgba(22,138,90,0.1)' },
            { label: 'Portfolio', value: stats?.totalPortfolios, icon: '💼', color: '#8a4000', bg: 'rgba(255,172,0,0.15)' },
            { label: 'Menunggu Review', value: stats?.pendingReviews, icon: '⏳', color: 'var(--danger)', bg: 'rgba(217,45,32,0.08)' },
            { label: 'Peluang Aktif', value: stats?.totalOpportunities, icon: '🚀', color: 'var(--primary-dark)', bg: 'rgba(74,27,157,0.09)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value ?? 0}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Pending breakdown */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">⏳ Pending Review</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Skill', value: stats?.pendingSkills, color: 'var(--primary)' },
                { label: 'Sertifikat', value: stats?.pendingCertificates, color: 'var(--primary-dark)' },
                { label: 'Portfolio', value: stats?.pendingPortfolios, color: 'var(--success)' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.875rem' }}>
                    <span>{item.label}</span>
                    <strong>{item.value ?? 0}</strong>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, ((item.value || 0) / Math.max(stats?.pendingReviews || 1, 1)) * 100)}%`,
                      background: item.color, transition: 'width 0.5s'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Students */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">🏆 Top 5 Mahasiswa</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.topStudents?.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i === 0 ? 'var(--secondary)' : i === 1 ? '#9ca3af' : i === 2 ? 'var(--accent-strong)' : 'rgba(112,0,112,0.1)',
                    color: i === 0 ? 'var(--text)' : i < 3 ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</div>
                  <UserAvatar name={s.name} avatarUrl={s.avatar} size={32} fontSize={11} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }} className="truncate">{s.name}</div>
                    {s.profile?.faculty && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.profile.faculty}</div>}
                  </div>
                  <div className="points-badge" style={{ fontSize: '0.7rem' }}>⭐ {s.points}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
