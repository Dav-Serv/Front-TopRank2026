import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Halaman ini hanya diakses oleh redirect dari Google OAuth.
 * URL: /auth/callback?token=xxx  atau  /auth/callback?error=oauth_failed
 *
 * Tugasnya:
 *  1. Ambil token dari query string
 *  2. Fetch /api/auth/me dengan token itu
 *  3. Simpan user + token ke context/localStorage
 *  4. Redirect ke dashboard
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const err   = searchParams.get('error');

    if (err || !token) {
      setError('Login dengan Google gagal. Silakan coba lagi.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    loginWithToken(token)
      .then((user) => {
        navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', { replace: true });
      })
      .catch(() => {
        setError('Gagal memverifikasi akun. Silakan coba lagi.');
        setTimeout(() => navigate('/login'), 3000);
      });
  }, []);  // eslint-disable-line

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Login Gagal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{error}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Mengalihkan ke halaman login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
        <div className="spinner spinner-dark" style={{ width: 48, height: 48, margin: '0 auto 1.5rem', borderWidth: 3 }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Memverifikasi akun Google...</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}
