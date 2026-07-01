import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GOOGLE_AUTH_URL = 'http://localhost:3000/api/auth/google';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', nim: '', faculty: '', major: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ maxWidth: 500 }}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-circle">🎓</div>
          <h1>Daftar Akun</h1>
          <p>Bergabung dengan University Talent Hub</p>
        </div>

        {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

        {/* Google OAuth Button */}
        <a
          href={GOOGLE_AUTH_URL}
          className="btn w-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.7rem 1rem',
            background: '#ffffff',
            border: '1.5px solid var(--border)',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.9rem',
            color: 'var(--text)',
            textDecoration: 'none',
            marginBottom: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#4285f4'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13.2c-.6 3-2.3 5.5-4.8 7.2v6h7.8c4.5-4.2 7.3-10.3 7.3-17.2z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.8 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.6v6.2C6.6 42.7 14.7 48 24 48z"/>
            <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6v-6.2H2.6C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l8-6.2z"/>
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.9 2.5 30.5 0 24 0 14.7 0 6.6 5.3 2.6 13.2l8 6.2C12.5 13.7 17.8 9.5 24 9.5z"/>
          </svg>
          Daftar dengan Google
        </a>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>atau daftar dengan email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap *</label>
            <input type="text" className="form-input" placeholder="Nama lengkap Anda" {...f('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" placeholder="email@universitas.ac.id" {...f('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" className="form-input" placeholder="Minimal 6 karakter" {...f('password')} required minLength={6} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">NIM</label>
              <input type="text" className="form-input" placeholder="2021XXXXX" {...f('nim')} />
            </div>
            <div className="form-group">
              <label className="form-label">Fakultas</label>
              <input type="text" className="form-input" placeholder="Teknik Informatika" {...f('faculty')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Jurusan/Program Studi</label>
            <input type="text" className="form-input" placeholder="Ilmu Komputer" {...f('major')} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading} style={{ marginTop: '0.25rem' }}>
            {loading ? <><div className="spinner" /> Mendaftar...</> : 'Daftar Sekarang'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Sudah punya akun?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Masuk</Link>
        </p>
      </div>
    </div>
  );
}
