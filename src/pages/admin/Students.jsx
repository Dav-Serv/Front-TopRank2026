import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import UserAvatar from '../../components/UserAvatar';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [selected, setSelected] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchStudents = useCallback((params = {}) => {
    setLoading(true);
    const q = new URLSearchParams({ search, skill, ...params });
    api.get(`/admin/students?${q}`).then(r => {
      setStudents(r.data.data);
      setMeta(r.data.meta);
    }).finally(() => setLoading(false));
  }, [search, skill]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await api.post('/ai/search', { query: aiQuery });
      setAiResult(res.data.data);
    } catch (err) {
      setAiResult({ recommendation: 'Error: ' + (err.response?.data?.message || 'Gagal'), students: [], aiPowered: false });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>👥 Data Mahasiswa</h1>
          <p>Kelola dan cari mahasiswa berdasarkan kompetensi</p>
        </div>
        <div className="points-badge">{meta.total || 0} Mahasiswa</div>
      </div>

      <div className="page-body">
        {/* AI Search */}
        <div className="card p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(112,0,112,0.07), rgba(255,204,0,0.1))', border: '1px solid rgba(112,0,112,0.12)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🤖 Pencarian Cerdas dengan AI</h3>
          <form onSubmit={handleAISearch} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              className="form-input flex-1"
              placeholder='Contoh: "Cari mahasiswa yang bisa develop aplikasi mobile dengan React Native"'
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={aiLoading} style={{ whiteSpace: 'nowrap' }}>
              {aiLoading ? <><div className="spinner" /> Mencari...</> : '🤖 Cari dengan AI'}
            </button>
          </form>
          {aiResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                {aiResult.recommendation}
              </div>
              {aiResult.students?.length > 0 && (
                <div>
                  <strong style={{ fontSize: '0.8rem' }}>Mahasiswa yang Relevan:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {aiResult.students.map(s => (
                      <span key={s.id} style={{ fontSize: '0.8rem', background: 'rgba(112,0,112,0.08)', color: 'var(--primary)', padding: '0.25rem 0.625rem', borderRadius: '6px', fontWeight: 600 }}>
                        {s.name} — {s.skills?.slice(0, 3).join(', ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Regular Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <input
            className="form-input flex-1"
            placeholder="Cari nama, email, atau NIM..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="Filter skill..."
            value={skill}
            onChange={e => setSkill(e.target.value)}
            style={{ width: 180 }}
          />
          <button type="submit" className="btn btn-primary">🔍 Cari</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSkill(''); fetchStudents({ search: '', skill: '' }); }}>Reset</button>
        </form>

        <div className="card">
          <div className="table-container">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner spinner-dark" style={{ width: 32, height: 32, margin: '0 auto' }} /></div>
            ) : students.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">👥</div><h3>Tidak ada mahasiswa ditemukan</h3></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Mahasiswa</th>
                    <th>NIM</th>
                    <th>Fakultas</th>
                    <th>Poin</th>
                    <th>Skill</th>
                    <th>Sertifikat</th>
                    <th>Portfolio</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <UserAvatar name={s.name} avatarUrl={s.avatar} size={36} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem' }}>{s.nim || '-'}</td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.profile?.faculty || '-'}</td>
                      <td><div className="points-badge" style={{ fontSize: '0.75rem' }}>⭐ {s.points}</div></td>
                      <td>{s._count.skills}</td>
                      <td>{s._count.certificates}</td>
                      <td>{s._count.portfolios}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => setSelected(s)}>Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 Detail Mahasiswa</h2>
              <button className="modal-close-btn" onClick={() => setSelected(null)} type="button">✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', padding: '1.125rem', background: 'linear-gradient(135deg, rgba(112,0,112,0.05), rgba(74,27,157,0.07))', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <UserAvatar name={selected.name} avatarUrl={selected.avatar} size={64} fontSize={22} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.2rem' }}>{selected.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selected.email}</p>
                  {selected.nim && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>NIM: {selected.nim}</p>}
                  <div className="points-badge" style={{ marginTop: '0.5rem' }}>⭐ {selected.points} Poin</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
                {[
                  { label: 'Skill', value: selected._count.skills, color: 'var(--primary)', icon: '⚡' },
                  { label: 'Sertifikat', value: selected._count.certificates, color: 'var(--primary-dark)', icon: '📜' },
                  { label: 'Portfolio', value: selected._count.portfolios, color: 'var(--success)', icon: '💼' },
                ].map(item => (
                  <div key={item.label} className="stat-card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{item.icon}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              {selected.profile?.bio && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#faf7fb', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{selected.profile.bio}</p>
                </div>
              )}
              {selected.profile?.faculty && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">🏛️ {selected.profile.faculty}</span>
                  {selected.profile?.major && <span className="badge badge-info">📚 {selected.profile.major}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
