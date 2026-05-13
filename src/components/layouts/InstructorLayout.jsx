import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import NotificationBell from '../NotificationBell';

const InstructorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: '/instructor/dashboard', icon: '🎯', label: 'Mes formations' },
    { to: '/instructor/analytics', icon: '📊', label: 'Analytics' },
    { to: '/instructor/create-course', icon: '✏️', label: 'Créer' },
    { to: '/courses', icon: '🌍', label: 'Explorer' },
    { to: '/chatbot', icon: '🤖', label: 'Assistant' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#0a110f' }}>

      <style>{`
        .inst-form-card {
        background: #0d1a14;
        border: 1px solid rgba(16,185,129,0.15);
        border-radius: 20px;
        }
        .inst-input {
        background: rgba(16,185,129,0.05);
        border: 1px solid rgba(16,185,129,0.2);
        border-radius: 12px;
        color: white;
        width: 100%;
        padding: 10px 16px;
        font-size: 14px;
        transition: all 0.2s ease;
        outline: none;
        }
        .inst-input:focus {
        border-color: rgba(16,185,129,0.5);
        box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .inst-input::placeholder { color: rgba(255,255,255,0.3); }
        .inst-label { color: #6ee7b7; font-size: 14px; font-weight: 500; margin-bottom: 6px; display: block; }
        .inst-sidebar {
          background: linear-gradient(180deg, #0d1a14 0%, #0a140f 100%);
          border-right: 1px solid rgba(16,185,129,0.15);
        }
        .inst-nav-item {
          transition: all 0.2s ease;
          border-radius: 12px;
        }
        .inst-nav-item:hover {
          background: rgba(16,185,129,0.1);
          border-left: 3px solid #10b981;
        }
        .inst-nav-active {
          background: rgba(16,185,129,0.15);
          border-left: 3px solid #10b981;
          color: #6ee7b7;
        }
        .inst-card {
          background: #0d1a14;
          border: 1px solid rgba(16,185,129,0.12);
          border-radius: 16px;
          transition: all 0.3s ease;
        }
        .inst-card:hover {
          border-color: rgba(16,185,129,0.3);
          box-shadow: 0 0 30px rgba(16,185,129,0.08);
        }
        .inst-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(16,185,129,0.3);
        }
        .inst-btn:hover {
          box-shadow: 0 6px 20px rgba(16,185,129,0.4);
          transform: translateY(-1px);
        }
        .badge-approved { background: rgba(16,185,129,0.2); color: #6ee7b7; }
        .badge-pending { background: rgba(245,158,11,0.2); color: #fcd34d; }
        .badge-rejected { background: rgba(239,68,68,0.2); color: #fca5a5; }
      `}</style>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="inst-sidebar w-64 fixed h-full z-40 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-emerald-900/30">
          <Link to="/instructor/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 0 20px rgba(16,185,129,0.4)',
              }}>
              <span className="text-white font-bold">EL</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm">E-Learn</div>
              <div className="text-emerald-400 text-xs">Instructor</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
            Navigation
          </p>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`inst-nav-item flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                isActive(item.to)
                  ? 'inst-nav-active'
                  : 'text-gray-400 hover:text-white'
              }`}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive(item.to) && (
                <motion.div
                  layoutId="instActiveIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-emerald-900/30">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{user?.name}</div>
              <div className="text-emerald-400 text-xs">Instructeur</div>
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
            background: 'rgba(10,17,15,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(16,185,129,0.1)',
          }}>
          <div>
            <h1 className="text-white font-semibold">
              {navItems.find(n => isActive(n.to))?.label || 'Dashboard'}
            </h1>
            <p className="text-emerald-400 text-xs mt-0.5">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-300"
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
              👨‍🏫 Instructor
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

export default InstructorLayout;