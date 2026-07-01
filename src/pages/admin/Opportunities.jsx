import { useEffect, useState } from 'react';
import api from '../../api/axios';

const TYPES = ['INTERNSHIP', 'COMPETITION', 'RESEARCH', 'JOB', 'SCHOLARSHIP', 'OTHER'];

export default function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'INTERNSHIP', company: '', location: '', deadline: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchOpps = () => {
    api.get('/opportunities').then(r => setOpps(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOpps(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        deadline: form.deadline || null
      };
      await api.post('/opportunities', data);
      setShowModal(false);
      setForm({ title: '', description: '', type: 'INTERNSHIP', company: '', location: '', deadline: '', tags: '' });
      fetchOpps();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat opportunity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus opportunity ini?')) return;
    await api.delete(`/opportunities/${id}`);
    fetchOpps();
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>💼 Opportunities</h1>
          <p>Posting peluang untuk mahasiswa</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Post Opportunity</button>
      </div>

      <div className="page-body">
        {opps.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">💼</div><h3>Belum ada opportunity</h3><button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>+ Post Opportunity</button></div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {opps.map(opp => (
              <div key={opp.id} className="card p-5">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{opp.title}</h3>
                      <span className="badge badge-primary">{opp.type}</span>
                    </div>
                    {opp.company && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>🏢 {opp.company} {opp.location ? `— 📍 ${opp.location}` : ''}</p>}
                    <p style={{ fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.75rem' }}>{opp.description.slice(0, 150)}</p>
                    {opp.deadline && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>⏰ Deadline: {new Date(opp.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    )}
                    {opp.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {opp.tags.map(t => <span key={t} style={{ fontSize: '0.75rem', background: 'rgba(74,27,157,0.08)', color: 'var(--primary-dark)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>{t}</span>)}
                      </div>
                    )}
                  </div>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: '1rem', flexShrink: 0 }} onClick={() => handleDelete(opp.id)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💼 Post Opportunity Baru</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)} type="button">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form-wrapper">
              <div className="modal-body">
                <div className="modal-form-grid">
                  {error && <div className="alert alert-error">⚠️ {error}</div>}
                  <div className="form-group">
                    <label className="form-label">Judul *</label>
                    <input className="form-input" placeholder="Internship Software Engineer" {...f('title')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi *</label>
                    <textarea className="form-input" placeholder="Deskripsi peluang..." {...f('description')} required rows={3} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tipe</label>
                      <select className="form-input" {...f('type')}>
                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Perusahaan/Instansi</label>
                      <input className="form-input" placeholder="PT. Tech Nusantara" {...f('company')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lokasi</label>
                      <input className="form-input" placeholder="Jakarta / Online" {...f('location')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Deadline</label>
                      <input type="date" className="form-input" {...f('deadline')} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(pisah koma)</span></label>
                    <input className="form-input" placeholder="React, Node.js, Figma" {...f('tags')} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><div className="spinner" /> Posting...</> : '🚀 Post Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
