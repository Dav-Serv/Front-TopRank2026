import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

const TYPES = ['PERSONAL', 'FREELANCE', 'INDUSTRI'];
const POINTS = { PERSONAL: 2, FREELANCE: 5, INDUSTRI: 8 };
const StatusBadge = ({ status }) => <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;

export default function Portfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'PERSONAL', techStack: '', projectUrl: '', repoUrl: '', imageUrl: '' });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const imgRef                  = useRef(null);

  const fetchPortfolios = () => {
    api.get('/portfolios/my').then(r => setPortfolios(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPortfolios(); }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload/portfolio-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(p => ({ ...p, imageUrl: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal upload gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {    e.preventDefault();
    setSaving(true); setError('');
    try {
      const data = {
        ...form,
        techStack: form.techStack ? form.techStack.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      await api.post('/portfolios', data);
      setShowModal(false);
      setForm({ title: '', description: '', type: 'PERSONAL', techStack: '', projectUrl: '', repoUrl: '', imageUrl: '' });
      fetchPortfolios();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan portfolio.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus portfolio ini?')) return;
    await api.delete(`/portfolios/${id}`);
    fetchPortfolios();
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  const typeColors = {
    PERSONAL:  { bg: 'rgba(112,0,112,0.08)', color: 'var(--primary)' },
    FREELANCE: { bg: 'rgba(255,172,0,0.15)',  color: '#6b3b00' },
    INDUSTRI:  { bg: 'rgba(22,138,90,0.1)',   color: '#065f46' }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>💼 Portfolio Saya</h1>
          <p>Tampilkan karya terbaik Anda</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tambah Portfolio</button>
      </div>

      <div className="page-body">
        <div className="card p-4 mb-4" style={{ background: 'rgba(22,138,90,0.07)', border: '1px solid rgba(22,138,90,0.2)' }}>
          <p style={{ fontSize: '0.875rem', color: '#065f46' }}>
            💡 <strong>Poin per Tipe:</strong>{' '}
            {TYPES.map(t => <span key={t} style={{ marginRight: '1rem' }}>{t}: {POINTS[t]} poin</span>)}
          </p>
        </div>

        {portfolios.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">💼</div>
              <h3>Belum ada portfolio</h3>
              <p>Tambahkan portfolio pertama Anda</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>+ Tambah Portfolio</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {portfolios.map(p => {
              const tc = typeColors[p.type] || typeColors.PERSONAL;
              return (
                <div key={p.id} className="card p-5">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <StatusBadge status={p.status} />
                    <span className="badge" style={{ background: tc.bg, color: tc.color }}>{p.type}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{p.title}</h3>
                  {p.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{p.description.slice(0, 100)}</p>}

                  {p.techStack?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      {p.techStack.map(t => (
                        <span key={t} style={{ fontSize: '0.7rem', background: '#f1f5f9', color: 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{t}</span>
                      ))}
                    </div>
                  )}

                  {p.points > 0 && <div className="points-badge" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>⭐ +{p.points} poin</div>}

                  {p.adminNote && p.status === 'REJECTED' && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', background: '#fee2e2', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                      ❌ {p.adminNote}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {p.projectUrl && (
                      <a href={p.projectUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>🌐 Demo</a>
                    )}
                    {p.repoUrl && (
                      <a href={p.repoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>💻 Repo</a>
                    )}
                    {p.status !== 'APPROVED' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Hapus</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💼 Tambah Portfolio</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)} type="button">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form-wrapper">
              <div className="modal-body">
                <div className="modal-form-grid">
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  <div className="form-group">
                    <label className="form-label">Judul Portfolio *</label>
                    <input className="form-input" placeholder="E-Commerce App, Redesign App..." {...f('title')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Portfolio</label>
                    <select className="form-input" {...f('type')}>
                      {TYPES.map(t => <option key={t} value={t}>{t} (+{POINTS[t]} poin)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi</label>
                    <textarea className="form-input" placeholder="Deskripsikan proyek Anda..." {...f('description')} rows={3} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tech Stack <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(pisah dengan koma)</span></label>
                    <input className="form-input" placeholder="React, Node.js, PostgreSQL" {...f('techStack')} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">URL Demo</label>
                      <input type="url" className="form-input" placeholder="https://..." {...f('projectUrl')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">URL Repository</label>
                      <input type="url" className="form-input" placeholder="https://github.com/..." {...f('repoUrl')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Screenshot / Gambar <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
                    <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    {form.imageUrl ? (
                      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={form.imageUrl} alt="Preview" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => imgRef.current?.click()}
                          disabled={uploading}
                          style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,0.9)' }}
                        >
                          {uploading ? 'Mengupload...' : '📷 Ganti'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => imgRef.current?.click()}
                        disabled={uploading}
                        style={{
                          width: '100%', padding: '1.25rem', border: '2px dashed var(--border)', borderRadius: '8px',
                          background: '#faf7fb', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        {uploading
                          ? <><div className="spinner spinner-dark" style={{ margin: '0 auto 0.5rem' }} /><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mengupload...</p></>
                          : <><p style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🖼️</p><p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Klik untuk upload screenshot</p><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>JPG, PNG, WebP · Maks. 5 MB</p></>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" /> Menyimpan...</> : '📤 Submit Verifikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
