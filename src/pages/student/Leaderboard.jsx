import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../../components/UserAvatar';

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard?limit=20').then(r => {
      setData(r.data.data);
      setMeta(r.data.meta);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>🏆 Leaderboard</h1>
          <p>Peringkat mahasiswa berdasarkan poin</p>
        </div>
        {meta.myRank && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Peringkat Anda</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>#{meta.myRank}</div>
          </div>
        )}
      </div>

      <div className="page-body">
        {/* Top 3 Podium */}
        {data.length >= 3 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}>
            {[data[1], data[0], data[2]].map((s, i) => {
              const medals    = ['🥈', '🥇', '🥉'];
              const rankNums  = [2, 1, 3];
              const isFirst   = i === 1;
              // Podium bar heights — visual only via padding-top, not fixed height
              const topPad    = ['2rem', '3.5rem', '1rem'][i];

              return (
                <div key={s.id} style={{
                  textAlign: 'center',
                  background: isFirst
                    ? 'linear-gradient(160deg, #fffbe6 0%, #ffffff 100%)'
                    : '#ffffff',
                  borderRadius: 12,
                  paddingTop: topPad,
                  paddingBottom: '1.125rem',
                  paddingLeft: '0.875rem',
                  paddingRight: '0.875rem',
                  width: isFirst ? 148 : 128,
                  border: isFirst ? '2px solid var(--secondary)' : '1px solid var(--border)',
                  boxShadow: isFirst
                    ? '0 6px 24px rgba(255,204,0,0.35)'
                    : 'var(--shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}>
                  {/* Rank number */}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: i === 0 ? '#9ca3af' : isFirst ? 'var(--secondary)' : 'var(--accent-strong)',
                    color: isFirst ? 'var(--text)' : '#ffffff',
                    fontSize: '0.72rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.15rem',
                  }}>{rankNums[i]}</div>

                  {/* Medal */}
                  <div style={{ fontSize: isFirst ? '2rem' : '1.6rem', lineHeight: 1 }}>{medals[i]}</div>

                  {/* Photo */}
                  <UserAvatar
                    name={s.name}
                    avatarUrl={s.avatar}
                    size={isFirst ? 52 : 44}
                  />

                  {/* Name — allow wrap, no truncate */}
                  <div style={{
                    fontSize: isFirst ? '0.82rem' : '0.75rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                    maxWidth: 120,
                  }}>
                    {s.name.split(' ').slice(0, 2).join(' ')}
                  </div>

                  {/* Points */}
                  <div className="points-badge" style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem' }}>
                    ⭐ {s.points}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Mahasiswa</th>
                  <th>Fakultas</th>
                  <th>Poin</th>
                  <th>Skill</th>
                  <th>Sertifikat</th>
                  <th>Portfolio</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {data.map(s => {
                  const isMe = s.id === user?.id;
                  const rankClass = s.rank === 1 ? 'rank-1' : s.rank === 2 ? 'rank-2' : s.rank === 3 ? 'rank-3' : 'rank-other';
                  return (
                    <tr key={s.id} style={{ background: isMe ? 'rgba(112,0,112,0.06)' : undefined }}>
                      <td>
                        <div className={`rank-badge ${rankClass}`}>{s.rank}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <UserAvatar name={s.name} avatarUrl={s.avatar} size={36} />
                          <div>
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {s.name}
                              {isMe && <span className="badge badge-primary">Anda</span>}
                            </div>
                            {s.nim && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.nim}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.profile?.faculty || '-'}</td>
                      <td><div className="points-badge" style={{ fontSize: '0.75rem' }}>⭐ {s.points}</div></td>
                      <td>{s._count.skills}</td>
                      <td>{s._count.certificates}</td>
                      <td>{s._count.portfolios}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {s.badges.slice(0, 2).map(ub => (
                            <span key={ub.id} style={{ fontSize: '0.65rem', background: 'rgba(112,0,112,0.08)', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                              🏅 {ub.badge.title}
                            </span>
                          ))}
                          {s.badges.length > 2 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{s.badges.length - 2}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
