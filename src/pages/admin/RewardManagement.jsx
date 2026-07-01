import { useEffect, useState } from 'react';
import api from '../../api/axios';

function RewardModal({ reward, onClose, onDone }) {
  const [form, setForm] = useState(reward || { title: '', description: '', pointsRequired: 10, stock: 10, imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (reward) {
        await api.put(`/rewards/${reward.id}`, form);
      } else {
        await api.post('/rewards', form);
      }
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan reward');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key] || '', onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{reward ? '✏️ Edit Reward' : '🎁 Tambah Reward'}</h2>
          <button className="modal-close-btn" onClick={onClose} type="button">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-form-grid">
              {error && <div className="alert alert-error">⚠️ {error}</div>}
              <div className="form-group">
                <label className="form-label">Nama Reward *</label>
                <input className="form-input" placeholder="Voucher Kantin Rp 25.000" {...f('title')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea className="form-input" placeholder="Deskripsi reward..." {...f('description')} rows={3} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Poin Dibutuhkan *</label>
                  <input type="number" className="form-input" min="1" {...f('pointsRequired')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stok</label>
                  <input type="number" className="form-input" min="0" {...f('stock')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">URL Gambar <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
                <input type="url" className="form-input" placeholder="https://..." {...f('imageUrl')} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" /> Menyimpan...</> : (reward ? '💾 Simpan Perubahan' : '+ Tambah Reward')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RewardManagement() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | reward object

  const fetchRewards = () => {
    api.get('/rewards/all').then(r => setRewards(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchRewards(); }, []);

  const handleToggle = async (reward) => {
    await api.put(`/rewards/${reward.id}`, { isActive: !reward.isActive });
    fetchRewards();
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus reward ini?')) return;
    await api.delete(`/rewards/${id}`);
    fetchRewards();
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-dark" style={{ width: 40, height: 40 }} /></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>🎁 Reward Management</h1>
          <p>Kelola daftar reward untuk mahasiswa</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ Tambah Reward</button>
      </div>

      <div className="page-body">
        {rewards.length === 0 ? (
          <div className="card"><div className="empty-state"><div className="empty-icon">🎁</div><h3>Belum ada reward</h3><button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setModal('create')}>+ Tambah Reward</button></div></div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Reward</th>
                    <th>Poin Dibutuhkan</th>
                    <th>Stok</th>
                    <th>Total Diklaim</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.title}</div>
                        {r.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.description.slice(0, 60)}</div>}
                      </td>
                      <td><div className="points-badge" style={{ fontSize: '0.75rem' }}>⭐ {r.pointsRequired}</div></td>
                      <td>{r.stock}</td>
                      <td>{r._count?.claims || 0}</td>
                      <td>
                        <span className={`badge ${r.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                          {r.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(r)}>Edit</button>
                          <button className="btn btn-warning btn-sm" onClick={() => handleToggle(r)} style={{ color: 'white' }}>
                            {r.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Hapus</button>
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

      {modal && (
        <RewardModal
          reward={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onDone={() => { setModal(null); fetchRewards(); }}
        />
      )}
    </div>
  );
}
