import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';

const highlights = [
  { value: '5+', label: 'Talent Demo' },
  { value: '3', label: 'Review Pending' },
  { value: 'AI', label: 'Smart Matching' },
];

const features = [
  {
    title: 'Profil Talenta Terverifikasi',
    desc: 'Mahasiswa dapat mengelola skill, sertifikat, portfolio, dan status verifikasi dalam satu tempat.',
  },
  {
    title: 'Gamifikasi Kampus',
    desc: 'Poin, badge, leaderboard, dan reward membuat aktivitas non-akademik lebih terlihat dan bernilai.',
  },
  {
    title: 'Pencarian Berbasis AI',
    desc: 'Admin dapat mencari mahasiswa berdasarkan kebutuhan industri atau kolaborasi dengan bahasa natural.',
  },
];

export default function Landing() {
  const { user } = useAuth();
  const dashboardPath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="brand-mark" aria-label="University Talent Hub">
          <span className="brand-symbol">UTH</span>
          <span>
            <strong>University Talent Hub</strong>
            <small>Ekosistem Talenta Mahasiswa</small>
          </span>
        </Link>
        <div className="landing-nav-actions">
          {user ? (
            <Link to={dashboardPath} className="btn btn-primary">Masuk Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Masuk</Link>
              <Link to="/register" className="btn btn-primary">Daftar</Link>
            </>
          )}
        </div>
      </nav>

      <section
        className="landing-hero"
        style={{ '--hero-image': `url(${heroImage})` }}
      >
        <div className="landing-hero-content fade-in">
          <p className="landing-kicker">Talent Mapping • Verification • Reward</p>
          <h1>Platform talenta mahasiswa untuk kampus yang lebih terhubung.</h1>
          <p>
            Dokumentasikan kompetensi, validasi pencapaian, temukan kandidat terbaik,
            dan dorong keterlibatan mahasiswa dengan sistem poin dan reward.
          </p>
          <div className="landing-cta">
            <Link to={user ? dashboardPath : '/login'} className="btn btn-primary btn-lg">
              {user ? 'Buka Dashboard' : 'Mulai Sekarang'}
            </Link>
            <Link to="/register" className="btn btn-light btn-lg">Buat Akun Mahasiswa</Link>
          </div>
          <div className="landing-stats" aria-label="Ringkasan platform">
            {highlights.map((item) => (
              <div key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" style={{ background: '#faf7fb' }}>
        <div className="section-heading">
          <p className="landing-kicker">MVP siap demo</p>
          <h2>Dibangun untuk alur utama penjurian.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
