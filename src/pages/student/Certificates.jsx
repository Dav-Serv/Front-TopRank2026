import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';

const LEVELS = ['LOKAL', 'REGIONAL', 'NASIONAL', 'INTERNASIONAL'];
const POINTS = { LOKAL: 1, REGIONAL: 3, NASIONAL: 5, INTERNASIONAL: 10 };
const StatusBadge = ({ status }) => <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;

export default function Certificates() {
  const [certs, setCerts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ title: '', issuer: '', level: 'LOKAL', issueDate: '', expireDate: '', credentialId: '', fileUrl: '', description: '' });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const fileRef                 = useRef(null);

  const fetchCerts = () => {
    api.get('/certificates/my').then(r => setCerts(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCerts(); }, []);

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
      setForm(p => ({ ...p, fileUrl: res.data.url }));
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
      await api.post('/certificates', form);
      setShowModal(false);
      setForm({ title: '', issuer: '', level: 'LOKAL', issueDate: '', expireDate: '', credentialId: '', fileUrl: '', description: '' });
      fetchCerts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan sertifikat.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    await api.delete(`/certificates/${id}`);
    fetchCerts();
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>📜 Sertifikat Saya</h1>
          <p>Upload dan ajukan verifikasi sertifikat Anda</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Upload Sertifikat</button>
      </div>

      <div className="page-body">
        {/* Info Points */}
        <div className="card p-4 mb-4" style={{ background: 'rgba(22,138,90,0.07)', border: '1px solid rgba(22,138,90,0.2)' }}>
          <p style={{ fontSize: '0.875rem', color: '#065f46' }}>
            💡 <strong>Poin per Level:</strong>{' '}
            {LEVELS.map(l => <span key={l} style={{ marginRight: '1rem' }}>{l}: {POINTS[l]} poin</span>)}
          </p>
        </div>

        {certs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <h3>Belum ada sertifikat</h3>
              <p>Upload sertifikat dan ajukan untuk verifikasi</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>+ Upload Sertifikat</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {certs.map(c => (
              <div key={c.id} className="card p-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <StatusBadge status={c.status} />
                  <span className="badge badge-primary">{c.level}</span>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '1rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🏛️ {c.issuer}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  📅 {new Date(c.issueDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                </p>
                {c.points > 0 && <div className="points-badge" style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>⭐ +{c.points} poin</div>}
                {c.adminNote && c.status === 'REJECTED' && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--danger)', background: '#fee2e2', padding: '0.5rem', borderRadius: '6px' }}>
                    ❌ {c.adminNote}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                  {c.fileUrl && (
                    <a href={c.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                      📎 Lihat File
                    </a>
                  )}
                  {c.status !== 'APPROVED' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Hapus</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📜 Upload Sertifikat</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)} type="button">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form-wrapper">
              <div className="modal-body">
                <div className="modal-form-grid">
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  <div className="form-group">
                    <label className="form-label">Nama Sertifikat *</label>
                    <input className="form-input" placeholder="Certified React Developer..." {...f('title')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Penerbit *</label>
                    <input className="form-input" placeholder="Meta, Google, Udemy..." {...f('issuer')} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Level *</label>
                      <select className="form-input" {...f('level')}>
                        {LEVELS.map(l => <option key={l} value={l}>{l} (+{POINTS[l]} poin)</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tanggal Terbit *</label>
                      <input type="date" className="form-input" {...f('issueDate')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tanggal Kadaluarsa</label>
                      <input type="date" className="form-input" {...f('expireDate')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ID Kredensial <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
                      <input className="form-input" placeholder="Opsional" {...f('credentialId')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">File Sertifikat <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(PDF / Gambar)</span></label>
                    <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileUpload} />
                    {form.fileUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', border: '1.5px solid var(--success)', borderRadius: '8px', background: 'rgba(22,138,90,0.05)' }}>
                        <span style={{ fontSize: '1.25rem' }}>📎</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)' }}>File berhasil diupload</p>
                          <a href={form.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lihat file →</a>
                        </div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>Ganti</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
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
                          : <><p style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>📄</p><p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Klik untuk upload PDF atau gambar</p><p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Maks. 10 MB</p></>
                        }
                      </button>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
                    <textarea className="form-input" placeholder="Deskripsi singkat sertifikat..." {...f('description')} rows={2} />
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
