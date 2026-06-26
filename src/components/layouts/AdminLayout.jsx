import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';

const navItems = [
  {
    to: '/admin/dashboard', label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    to: '/admin/courses', label: 'Formations',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  },
  {
  to: '/admin/categories', label: 'Catégories',
  icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
},
  {
    to: '/admin/videos', label: 'Vidéos',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  },
  {
    to: '/admin/users', label: 'Utilisateurs',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    to: '/admin/applications', label: 'Candidatures',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/></svg>,
  },
  {
  to: '/admin/category-requests', label: 'Catégories',
  icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
},
  {
  to: '/admin/absences', label: 'Justificatifs',
  icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
},
{
  to: '/admin/penalties', label: 'Amendes',
  icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
},
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const bg = dark ? '#0a0a0f' : '#f8fafc';
  const sidebarBg = dark ? 'linear-gradient(180deg,#0d0d1a 0%,#0a0a14 100%)' : 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)';
  const sidebarBorder = dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb';
  const headerBg = dark ? 'rgba(10,10,15,0.85)' : 'rgba(255,255,255,0.9)';
  const headerBorder = dark ? 'rgba(99,102,241,0.1)' : '#e5e7eb';
  const navHover = dark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)';
  const navActive = dark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';
  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSecondary = dark ? 'rgba(255,255,255,0.5)' : '#6b7280';
  const accent = '#6366f1';

  return (
    <div className="min-h-screen flex" style={{ background: bg }}>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }} animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-64 fixed h-full z-40 flex flex-col"
        style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBorder}` }}>

        {/* Logo */}
        <div className="p-6" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              <span className="text-white font-bold text-sm">EL</span>
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: textPrimary }}>E-Learn</div>
              <div className="text-xs" style={{ color: accent }}>Administration</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3"
            style={{ color: dark ? 'rgba(99,102,241,0.5)' : '#9ca3af' }}>Navigation</p>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all"
              style={isActive(item.to) ? {
                background: navActive,
                borderLeft: `3px solid ${accent}`,
                color: accent,
              } : {
                color: textSecondary,
              }}
              onMouseEnter={e => { if (!isActive(item.to)) e.currentTarget.style.background = navHover; }}
              onMouseLeave={e => { if (!isActive(item.to)) e.currentTarget.style.background = 'transparent'; }}>
              {item.icon}
              <span>{item.label}</span>
              {isActive(item.to) && (
                <motion.div layoutId="adminActive"
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: accent }} />
              )}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4" style={{ borderTop: `1px solid ${sidebarBorder}` }}>
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: textPrimary }}>{user?.name}</div>
              <div className="text-xs" style={{ color: accent }}>Administrateur</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition">
            Se déconnecter
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 px-8 py-4 flex justify-between items-center"
          style={{ background: headerBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${headerBorder}` }}>
          <div>
            <h1 className="font-semibold" style={{ color: textPrimary }}>
              {navItems.find(n => isActive(n.to))?.label || 'Dashboard'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: accent }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <div className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Admin
            </div>
          </div>
        </motion.header>

        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex-1 p-8">
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;