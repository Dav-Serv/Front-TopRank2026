import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm]       = useState({});
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]         = useState('');
  const fileInputRef          = useRef(null);

  useEffect(() => {
    api.get('/profile/me').then(res => {
      const u = res.data.data;
      // Prioritas: avatar dari DB (bisa berupa upload lokal atau foto Google OAuth)
      setAvatarUrl(u.avatar || '');
      setForm({
        name:     u.name             || '',
        nim:      u.nim              || '',
        bio:      u.profile?.bio     || '',
        phone:    u.profile?.phone   || '',
        address:  u.profile?.address || '',
        faculty:  u.profile?.faculty || '',
        major:    u.profile?.major   || '',
        semester: u.profile?.semester || '',
        gpa:      u.profile?.gpa     || '',
        linkedin: u.profile?.linkedin || '',
        github:   u.profile?.github  || '',
        website:  u.profile?.website || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  // Upload avatar — fire-and-forget, saves URL in form state
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMsg('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/upload/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(res.data.url);
      // Save avatar immediately to DB
      await api.put('/profile/me', { avatar: res.data.url });
      await refreshUser();
      setMsg('avatar-ok');
    } catch (err) {
      setMsg('error: ' + (err.response?.data?.message || 'Gagal upload foto'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put('/profile/me', { ...form, avatar: avatarUrl });
      await refreshUser();
      setMsg('success');
    } catch (err) {
      setMsg('error: ' + (err.response?.data?.message || 'Gagal menyimpan'));
    } finally {
      setSaving(false);
    }
  };

  const f = (key) => ({
    value: form[key] || '',
    onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const initials = form.name
    ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-dark" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>👤 Profil Saya</h1>
          <p>Lengkapi profil untuk mendapatkan badge dan meningkatkan peluang</p>
        </div>
        <div className="points-badge">⭐ {user?.points || 0} Poin</div>
      </div>

      <div className="page-body">
        {msg === 'success'    && <div className="alert alert-success mb-4">✅ Profil berhasil disimpan!</div>}
        {msg === 'avatar-ok'  && <div className="alert alert-success mb-4">✅ Foto profil diperbarui!</div>}
        {msg.startsWith('error') && <div className="alert alert-error mb-4">⚠️ {msg.replace('error: ', '')}</div>}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* ── Main Info ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Informasi Dasar</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Nama Lengkap</label>
                    <input className="form-input" {...f('name')} placeholder="Nama lengkap" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">NIM</label>
                    <input className="form-input" {...f('nim')} placeholder="2021XXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">No. Telepon</label>
                    <input className="form-input" {...f('phone')} placeholder="08XXXXXXXXXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fakultas</label>
                    <input className="form-input" {...f('faculty')} placeholder="Teknik Informatika" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Program Studi</label>
                    <input className="form-input" {...f('major')} placeholder="Ilmu Komputer" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <input type="number" className="form-input" {...f('semester')} placeholder="6" min="1" max="14" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IPK</label>
                    <input type="number" className="form-input" {...f('gpa')} placeholder="3.50" step="0.01" min="0" max="4" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Bio / Tentang Saya</label>
                    <textarea className="form-input" {...f('bio')} placeholder="Ceritakan tentang diri Anda..." rows={3} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Alamat</label>
                    <input className="form-input" {...f('address')} placeholder="Kota, Provinsi" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">🔗 Social & Portfolio Links</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">LinkedIn</label>
                    <input className="form-input" {...f('linkedin')} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub</label>
                    <input className="form-input" {...f('github')} placeholder="https://github.com/username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Website / Portfolio</label>
                    <input className="form-input" {...f('website')} placeholder="https://portfolio.com" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Avatar card */}
              <div className="card p-6" style={{ textAlign: 'center' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', width: 92, height: 92, margin: '0 auto 0.75rem' }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      style={{ width: 92, height: 92, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)', display: 'block' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="avatar" style={{ width: 92, height: 92, fontSize: 32 }}>{initials}</div>
                  )}

                  {/* Badge Google jika foto dari Google */}
                  {avatarUrl?.includes('googleusercontent.com') && (
                    <div style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 24, height: 24, borderRadius: '50%',
                      background: '#fff', border: '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem',
                    }} title="Foto dari Google">
                      <svg width="13" height="13" viewBox="0 0 48 48">
                        <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.5-4.2 7.3-10.3 7.3-17.2z"/>
                        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.8 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.6v6.2C6.6 42.7 14.7 48 24 48z"/>
                        <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6v-6.2H2.6C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l8-6.2z"/>
                        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.5 30.5 0 24 0 14.7 0 6.6 5.3 2.6 13.2l8 6.2C12.5 13.7 17.8 9.5 24 9.5z"/>
                      </svg>
                    </div>
                  )}

                  {/* Hover overlay untuk upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '50%',
                      background: 'rgba(22,0,29,0.52)',
                      border: '2px dashed rgba(255,255,255,0.65)',
                      color: '#fff',
                      cursor: uploading ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '0.15rem',
                      opacity: 0,
                      transition: 'opacity 0.15s',
                      fontSize: '1.25rem',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    title="Ganti foto profil"
                  >
                    {uploading
                      ? <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', width: 22, height: 22 }} />
                      : <>📷<span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.02em' }}>GANTI</span></>
                    }
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn btn-secondary btn-sm"
                  style={{ marginBottom: '1rem' }}
                >
                  {uploading ? <><div className="spinner spinner-dark" /> Mengupload...</> : '📷 Ganti Foto'}
                </button>

                <h3 style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{form.name || 'Nama Anda'}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{form.faculty || 'Fakultas'}</p>
                <div className="points-badge" style={{ margin: '0.75rem auto 0', display: 'inline-flex' }}>
                  ⭐ {user?.points || 0} Poin
                </div>
              </div>

              {/* Profile completeness */}
              <div className="card p-6">
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>📊 Kelengkapan Profil</h3>
                {(() => {
                  const fields = ['name', 'nim', 'bio', 'phone', 'faculty', 'major', 'linkedin'];
                  const filled = fields.filter(k => form[k]).length;
                  const pct = Math.round((filled / fields.length) * 100);
                  const color = pct < 40 ? 'var(--danger)' : pct < 70 ? 'var(--accent)' : 'var(--success)';
                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{filled}/{fields.length} field diisi</span>
                        <strong style={{ color }}>{pct}%</strong>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, var(--primary), ${color})`, transition: 'width 0.4s' }} />
                      </div>
                      {pct < 100 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          Lengkapi profil untuk mendapatkan badge dan prioritas di leaderboard.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><div className="spinner" /> Menyimpan...</> : '💾 Simpan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
