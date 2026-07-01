import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Auth pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import Skills from './pages/student/Skills';
import Certificates from './pages/student/Certificates';
import Portfolios from './pages/student/Portfolios';
import Leaderboard from './pages/student/Leaderboard';
import Rewards from './pages/student/Rewards';
import AIRecommend from './pages/student/AIRecommend';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Verifikasi from './pages/admin/Verifikasi';
import RewardManagement from './pages/admin/RewardManagement';
import Opportunities from './pages/admin/Opportunities';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-dark" style={{ width: 48, height: 48, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  if (!adminOnly && user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Landing />} />

          {/* Student routes */}
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route path="/portfolios" element={<ProtectedRoute><Portfolios /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/ai-recommend" element={<ProtectedRoute><AIRecommend /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute adminOnly><Students /></ProtectedRoute>} />
          <Route path="/admin/verifikasi" element={<ProtectedRoute adminOnly><Verifikasi /></ProtectedRoute>} />
          <Route path="/admin/rewards" element={<ProtectedRoute adminOnly><RewardManagement /></ProtectedRoute>} />
          <Route path="/admin/leaderboard" element={<ProtectedRoute adminOnly><Leaderboard /></ProtectedRoute>} />
          <Route path="/admin/opportunities" element={<ProtectedRoute adminOnly><Opportunities /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
