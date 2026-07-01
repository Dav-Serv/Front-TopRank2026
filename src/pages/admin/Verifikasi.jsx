import { useEffect, useState } from 'react';
import api from '../../api/axios';

const POINT_OPTS = [1, 2, 3, 5, 8, 10, 15, 20];

function VerifyModal({ item, type, onClose, onDone }) {
  const [status, setStatus] = useState('APPROVED');
  const [points, setPoints] = useState(5);
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const endpoint = type === 'skill' ? `/skills/${item.id}/verify`
        : type === 'cert' ? `/certificates/${item.id}/verify`
        : `/portfolios/${item.id}/verify`;
      await api.patch(endpoint, { status, points: parseInt(points), adminNote });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memverifikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {type === 'skill' ? '⚡ Verifikasi Skill' : type === 'cert' ? '📜 Verifikasi Sertifikat' : '💼 Verifikasi Portfolio'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} type="button">✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>⚠️ {error}</div>}

          <div className="modal-info-box">
            <h3>{item.name || item.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
              <p>Mahasiswa: <strong style={{ color: 'var(--text)' }}>{item.user?.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({item.user?.nim || item.user?.email})</span></p>
              {item.level && <p>Level: <strong style={{ color: 'var(--text)' }}>{item.level}</strong></p>}
              {item.type && <p>Tipe: <strong style={{ color: 'var(--text)' }}>{item.type}</strong></p>}
              {item.issuer && <p>Penerbit: <strong style={{ color: 'var(--text)' }}>{item.issuer}</strong></p>}
              {item.description && <p style={{ marginTop: '0.4rem', color: 'var(--text)', fontSize: '0.82rem' }}>{item.description}</p>}
            </div>
            {(item.proofUrl || item.fileUrl || item.projectUrl || item.repoUrl) && (
              <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {item.proofUrl && <a href={item.proofUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>🔗 Bukti</a>}
                {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>📎 File</a>}
                {item.projectUrl && <a href={item.projectUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>🌐 Demo</a>}
                {item.repoUrl && <a href={item.repoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>💻 Repo</a>}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-form-grid">
              <div className="form-group">
                <label className="form-label">Keputusan</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { val: 'APPROVED', label: '✅ Approve', color: 'var(--success)', bg: 'rgba(22,138,90,0.08)' },
                    { val: 'REJECTED', label: '❌ Reject',  color: 'var(--danger)',  bg: 'rgba(217,45,32,0.08)' },
                  ].map(opt => (
                    <label key={opt.val} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                      padding: '0.625rem', borderRadius: '8px',
                      border: `2px solid ${status === opt.val ? opt.color : 'var(--border)'}`,
                      background: status === opt.val ? opt.bg : '#ffffff',
                      color: status === opt.val ? opt.color : 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" value={opt.val} checked={status === opt.val} onChange={() => setStatus(opt.val)} style={{ display: 'none' }} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {status === 'APPROVED' && (
                <div className="form-group">
                  <label className="form-label">Poin yang Diberikan</label>
                  <select className="form-input" value={points} onChange={e => setPoints(e.target.value)}>
                    {POINT_OPTS.map(p => <option key={p} value={p}>{p} poin</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Catatan Admin <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
                <textarea className="form-input" value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Alasan penolakan atau catatan tambahan..." rows={3} />
              </div>
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', borderRadius: '0 0 14px 14px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
              <button type="submit" className={`btn ${status === 'APPROVED' ? 'btn-success' : 'btn-danger'}`} disabled={loading}>
                {loading ? <><div className="spinner" /> Memproses...</> : status === 'APPROVED' ? '✅ Approve & Beri Poin' : '❌ Tolak Pengajuan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Verifikasi() {
  const [data, setData] = useState({ skills: [], certificates: [], portfolios: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('skills');
  const [verifyItem, setVerifyItem] = useState(null);
  const [verifyType, setVerifyType] = useState(null);

  const fetchData = () => {
    api.get('/admin/pending').then(r => setData(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const tabs = [
    { id: 'skills', label: `⚡ Skill (${data.skills.length})` },
    { id: 'certificates', label: `📜 Sertifikat (${data.certificates.length})` },
    { id: 'portfolios', label: `💼 Portfolio (${data.portfolios.length})` },
  ];

  const currentItems = data[tab] || [];
  const typeMap = { skills: 'skill', certificates: 'cert', portfolios: 'portfolio' };

  const renderTable = (items, type) => {
    if (items.length === 0) {
      return <div className="empty-state"><div className="empty-icon">✅</div><h3>Semua sudah diverifikasi</h3><p>Tidak ada pengajuan pending</p></div>;
    }
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mahasiswa</th>
              <th>{type === 'skill' ? 'Skill' : type === 'cert' ? 'Sertifikat' : 'Portfolio'}</th>
              <th>{type === 'skill' ? 'Kategori' : type === 'cert' ? 'Level' : 'Tipe'}</th>
              <th>Tanggal Submit</th>
              <th>Bukti</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.user?.nim || item.user?.email}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 600 }}>{item.name || item.title}</div>
                  {(type === 'skill' && item.level) && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.level}</div>}
                  {(type === 'cert' && item.issuer) && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.issuer}</div>}
                  {(type === 'portfolio' && item.techStack?.length > 0) && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.techStack.slice(0, 3).join(', ')}</div>
                  )}
                </td>
                <td><span className="badge badge-info">{item.category || item.level || item.type}</span></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(item.submittedAt).toLocaleDateString('id-ID')}
                </td>
                <td>
                  {(item.proofUrl || item.fileUrl || item.projectUrl) ? (
                    <a href={item.proofUrl || item.fileUrl || item.projectUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                      👁 Lihat
                    </a>
                  ) : '-'}
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => { setVerifyItem(item); setVerifyType(typeMap[tab]); }}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  const totalPending = data.skills.length + data.certificates.length + data.portfolios.length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>✅ Verifikasi Pengajuan</h1>
          <p>Review dan verifikasi pengajuan mahasiswa</p>
        </div>
        {totalPending > 0 && (
          <div style={{ background: 'rgba(217,45,32,0.1)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, border: '1px solid rgba(217,45,32,0.2)' }}>
            ⏳ {totalPending} menunggu
          </div>
        )}
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn${tab === t.id ? ' active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="card">
          {renderTable(currentItems, typeMap[tab])}
        </div>
      </div>

      {verifyItem && (
        <VerifyModal
          item={verifyItem}
          type={verifyType}
          onClose={() => { setVerifyItem(null); setVerifyType(null); }}
          onDone={() => { setVerifyItem(null); setVerifyType(null); fetchData(); }}
        />
      )}
    </div>
  );
}
