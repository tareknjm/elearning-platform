import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import NotificationBell from '../NotificationBell';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: '/admin/dashboard', icon: '⚡', label: 'Dashboard' },
    { to: '/admin/courses', icon: '📚', label: 'Formations' },
    { to: '/admin/users', icon: '👥', label: 'Utilisateurs' },
    { to: '/admin/applications', icon: '📋', label: 'Candidatures' },
  ];

  return (
    <div className="min-h-screen flex"
      style={{ background: '#0a0a0f' }}>

      <style>{`
        .admin-input {
        background: rgba(99,102,241,0.05);
        border: 1px solid rgba(99,102,241,0.2);
        border-radius: 12px;
        color: white;
        width: 100%;
        padding: 10px 16px;
        font-size: 14px;
        transition: all 0.2s ease;
        outline: none;
        }
        .admin-input:focus {
        border-color: rgba(99,102,241,0.5);
        box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .admin-input::placeholder { color: rgba(255,255,255,0.3); }
        .admin-input option { background: #0d0d1a; color: white; }
        .admin-label { color: #a5b4fc; font-size: 14px; font-weight: 500; margin-bottom: 6px; display: block; }
        .admin-form-card {
        background: #0d0d1a;
        border: 1px solid rgba(99,102,241,0.15);
        border-radius: 20px;
        padding: 24px;
        }
        .admin-sidebar {
          background: linear-gradient(180deg, #0d0d1a 0%, #0a0a14 100%);
          border-right: 1px solid rgba(99,102,241,0.15);
        }
        .admin-nav-item {
          transition: all 0.2s ease;
          border-radius: 12px;
        }
        .admin-nav-item:hover {
          background: rgba(99,102,241,0.1);
          border-left: 3px solid #6366f1;
        }
        .admin-nav-active {
          background: rgba(99,102,241,0.15);
          border-left: 3px solid #6366f1;
          color: #818cf8;
        }
        .admin-card {
          background: #0d0d1a;
          border: 1px solid rgba(99,102,241,0.12);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        .admin-card:hover {
          border-color: rgba(99,102,241,0.3);
          box-shadow: 0 0 30px rgba(99,102,241,0.08);
        }
        .glow-blue {
          box-shadow: 0 0 20px rgba(99,102,241,0.3);
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .scan-line {
          animation: scan 4s linear infinite;
          opacity: 0.03;
        }
      `}</style>

      {/* Ligne de scan décorative */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="scan-line w-full h-0.5"
          style={{ background: 'linear-gradient(to right, transparent, #6366f1, transparent)' }} />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="admin-sidebar w-64 fixed h-full z-40 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-indigo-900/30">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-blue"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <span className="text-white font-bold">EL</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm">E-Learn</div>
              <div className="text-indigo-400 text-xs">Administration</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
            Navigation
          </p>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`admin-nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                isActive(item.to)
                  ? 'admin-nav-active'
                  : 'text-gray-400 hover:text-white'
              }`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.to) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-indigo-900/30">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{user?.name}</div>
              <div className="text-indigo-400 text-xs">Administrateur</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-xl text-sm transition">
            Se déconnecter
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 px-8 py-4 flex justify-between items-center"
          style={{
            background: 'rgba(10,10,15,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.1)',
          }}>
          <div>
            <h1 className="text-white font-semibold">
              {navItems.find(n => isActive(n.to))?.label || 'Dashboard'}
            </h1>
            <p className="text-indigo-400 text-xs mt-0.5">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-300"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
              🛡️ Admin
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 p-8 relative z-10">
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;