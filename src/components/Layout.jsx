import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { to: '/admin/dashboard',    icon: '📊', label: 'Dashboard' },
  { to: '/admin/students',     icon: '👥', label: 'Data Mahasiswa' },
  { to: '/admin/verifikasi',   icon: '✅', label: 'Verifikasi' },
  { to: '/admin/rewards',      icon: '🎁', label: 'Reward Management' },
  { to: '/admin/leaderboard',  icon: '🏆', label: 'Leaderboard' },
  { to: '/admin/opportunities',icon: '💼', label: 'Opportunities' },
];

const studentNav = [
  { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/profile',       icon: '👤', label: 'Profil Saya' },
  { to: '/skills',        icon: '⚡', label: 'Skill' },
  { to: '/certificates',  icon: '📜', label: 'Sertifikat' },
  { to: '/portfolios',    icon: '💼', label: 'Portfolio' },
  { to: '/leaderboard',   icon: '🏆', label: 'Leaderboard' },
  { to: '/rewards',       icon: '🎁', label: 'Reward Catalog' },
  { to: '/ai-recommend',  icon: '🤖', label: 'AI Rekomendasi' },
];

// Komponen avatar universal — pakai foto jika ada, fallback ke inisial
function Avatar({ name, avatarUrl, size = 40 }) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Google photo URL kadang perlu size yang lebih besar
  const resolvedUrl = avatarUrl?.includes('googleusercontent.com')
    ? avatarUrl.replace(/=s\d+-c$/, '=s96-c')   // pastikan ukuran 96px
    : avatarUrl;

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt={name || 'avatar'}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.3)',
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? adminNav : studentNav;
  const profilePath = isAdmin ? '/admin/dashboard' : '/profile';

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <div className="logo-text">
            University<br />
            <span className="logo-sub">Talent Hub</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Menu</div>
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer — user info + logout button terpisah */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>

            {/* Klik nama/avatar → ke profile */}
            <div
              className="sidebar-user"
              style={{ flex: 1, minWidth: 0 }}
              onClick={() => navigate(profilePath)}
              title="Lihat Profil"
            >
              <Avatar name={user?.name} avatarUrl={user?.avatar} />
              <div className="user-info">
                <div className="user-name truncate">{user?.name}</div>
                <div className="user-role">
                  {isAdmin ? '👑 Admin' : `⭐ ${user?.points || 0} poin`}
                </div>
              </div>
            </div>

            {/* Tombol logout terpisah */}
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                flexShrink: 0,
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(217,45,32,0.7)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
