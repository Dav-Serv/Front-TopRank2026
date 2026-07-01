import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

const CATEGORIES = ['PROGRAMMING', 'DESIGN', 'LANGUAGE', 'SOFT_SKILL', 'OTHER'];
const LEVELS     = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const CATEGORY_LABEL = {
  PROGRAMMING: '💻 Programming',
  DESIGN:      '🎨 Design',
  LANGUAGE:    '🗣️ Language',
  SOFT_SKILL:  '🤝 Soft Skill',
  OTHER:       '📌 Other',
};

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
);

export default function Skills() {
  const [skills, setSkills]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name: '', category: 'OTHER', level: 'Beginner', description: '', proofUrl: '' });
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const fileRef                   = useRef(null);

  const fetchSkills = () => {
    api.get('/skills/my').then(r => setSkills(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload/certificate', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(p => ({ ...p, proofUrl: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/skills', form);
      setShowModal(false);
      setForm({ name: '', category: 'OTHER', level: 'Beginner', description: '', proofUrl: '' });
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus skill ini?')) return;
    await api.delete(`/skills/${id}`);
    fetchSkills();
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const resetModal = () => {
    setShowModal(false);
    setForm({ name: '', category: 'OTHER', level: 'Beginner', description: '', proofUrl: '' });
    setError('');
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>⚡ Skill Saya</h1>
          <p>Tambah dan ajukan verifikasi skill Anda</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Tambah Skill</button>
      </div>

      <div className="page-body">
        {skills.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">⚡</div>
              <h3>Belum ada skill</h3>
              <p>Tambahkan skill pertama Anda dan ajukan untuk verifikasi</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>+ Tambah Skill</button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nama Skill</th>
                    <th>Kategori</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th>Poin</th>
                    <th>Bukti</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        {s.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{s.description}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-info">{CATEGORY_LABEL[s.category] || s.category}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{s.level}</span>
                      </td>
                      <td><StatusBadge status={s.status} /></td>
                      <td>
                        {s.points > 0
                          ? <span className="points-badge" style={{ fontSize: '0.75rem' }}>⭐ {s.points}</span>
                          : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                      </td>
                      <td>
                        {s.proofUrl ? (
                          <a
                            href={s.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ textDecoration: 'none' }}
                          >
                            👁 Lihat
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {s.status !== 'APPROVED' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Hapus</button>
                          )}
                          {s.status === 'REJECTED' && s.adminNote && (
                            <div style={{
                              fontSize: '0.72rem', color: 'var(--danger)',
                              background: 'rgba(217,45,32,0.07)', padding: '0.3rem 0.5rem',
                              borderRadius: '4px', maxWidth: 180,
                            }}>
                              ❌ {s.adminNote}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal tambah skill */}
      {showModal && (
        <div className="modal-overlay" onClick={resetModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚡ Tambah Skill Baru</h2>
              <button className="modal-close-btn" onClick={resetModal} type="button">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  {error && <div className="alert alert-error">⚠️ {error}</div>}

                  <div className="form-group">
                    <label className="form-label">Nama Skill *</label>
                    <input className="form-input" placeholder="React.js, Figma, Public Speaking..." {...f('name')} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Kategori</label>
                      <select className="form-input" {...f('category')}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Level</label>
                      <select className="form-input" {...f('level')}>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deskripsi <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
                    <textarea className="form-input" placeholder="Jelaskan pengalaman Anda dengan skill ini..." {...f('description')} rows={3} />
                  </div>

                  {/* File upload bukti */}
                  <div className="form-group">
                    <label className="form-label">
                      Bukti <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(sertifikat, screenshot, PDF)</span>
                    </label>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    {form.proofUrl ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.625rem 0.875rem',
                        border: '1.5px solid var(--success)', borderRadius: '8px',
                        background: 'rgba(22,138,90,0.05)',
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>📎</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>File berhasil diupload</p>
                          <a href={form.proofUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lihat file →</a>
                        </div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                          Ganti
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          style={{
                            width: '100%', padding: '1.125rem',
                            border: '2px dashed var(--border)', borderRadius: '8px',
                            background: '#faf7fb', cursor: 'pointer', textAlign: 'center',
                            transition: 'border-color 0.15s', marginBottom: '0.5rem',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          {uploading
                            ? <><div className="spinner spinner-dark" style={{ margin: '0 auto 0.4rem' }} /><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mengupload...</p></>
                            : <><p style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>📄</p><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload bukti (PDF / gambar)</p><p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Maks. 10 MB</p></>
                          }
                        </button>
                        {/* atau URL manual */}
                        <input
                          className="form-input"
                          type="url"
                          placeholder="Atau tempel URL: https://..."
                          value={form.proofUrl}
                          onChange={e => setForm(p => ({ ...p, proofUrl: e.target.value }))}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetModal}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
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
