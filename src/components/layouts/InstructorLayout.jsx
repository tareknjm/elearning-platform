import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';

const navItems = [
  {
    to: '/instructor/dashboard', label: 'Dashboard',
    icon: <i className="fa-solid fa-gauge-high w-4 text-center" />,
  },
  {
    to: '/instructor/analytics', label: 'Analytics',
    icon: <i className="fa-solid fa-chart-line w-4 text-center" />,
  },
  {
    to: '/instructor/availability', label: 'Disponibilités',
    icon: <i className="fa-solid fa-calendar-week w-4 text-center" />,
  },
  {
    to: '/instructor/video-calls', label: 'Mes appels',
    icon: <i className="fa-solid fa-video w-4 text-center" />,
    badge: 'Nouveau',
  },
  {
  to: '/instructor/absences', label: 'Absences',
  icon: <i className="fa-solid fa-file-medical w-4 text-center" />,
},
  {
    to: '/instructor/create-course', label: 'Créer un cours',
    icon: <i className="fa-solid fa-circle-plus w-4 text-center" />,
  },
  {
    to: '/chatbot', label: 'Assistant IA',
    icon: <i className="fa-solid fa-robot w-4 text-center" />,
  },
];

const InstructorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const bg           = dark ? '#0a110f' : '#f0fdf4';
  const sidebarBg    = dark ? 'linear-gradient(180deg,#0d1a14 0%,#0a140f 100%)' : 'linear-gradient(180deg,#ffffff 0%,#f0fdf4 100%)';
  const sidebarBorder= dark ? 'rgba(16,185,129,0.15)' : '#d1fae5';
  const headerBg     = dark ? 'rgba(10,17,15,0.85)' : 'rgba(255,255,255,0.9)';
  const headerBorder = dark ? 'rgba(16,185,129,0.1)' : '#d1fae5';
  const navHover     = dark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)';
  const navActive    = dark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)';
  const textPrimary  = dark ? '#ffffff' : '#111827';
  const textSub      = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const accent       = '#10b981';
  const accentLight  = dark ? '#6ee7b7' : '#059669';

  const currentLabel = navItems.find(n => isActive(n.to))?.label || 'Dashboard';

  return (
    <div className="min-h-screen flex" style={{ background: bg }}>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -280 }} animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-60 fixed h-full z-40 flex flex-col"
        style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBorder}` }}>

        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
          <Link to="/instructor/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 16px rgba(16,185,129,0.35)' }}>
              <span className="text-white font-bold text-xs">EL</span>
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: textPrimary }}>E-Learn</div>
              <div className="text-[11px] font-medium" style={{ color: accentLight }}>Espace instructeur</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-3"
            style={{ color: dark ? 'rgba(16,185,129,0.4)' : '#9ca3af' }}>
            Navigation
          </p>

          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all relative"
                style={active ? {
                  background: navActive,
                  borderLeft: `3px solid ${accent}`,
                  color: accentLight,
                  paddingLeft: '9px',
                } : { color: textSub }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = navHover; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>

                <span style={{ color: active ? accentLight : textSub }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>

                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.15)', color: accentLight, border: '1px solid rgba(16,185,129,0.3)' }}>
                    {item.badge}
                  </span>
                )}

                {active && (
                  <motion.div layoutId="instActive"
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: accent }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${sidebarBorder}` }}>
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: textPrimary }}>{user?.name}</div>
              <div className="text-[11px]" style={{ color: accentLight }}>Instructeur</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-left px-3 py-2 rounded-xl text-sm transition flex items-center gap-2"
            style={{ color: '#f87171' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <i className="fa-solid fa-arrow-right-from-bracket text-[13px]" />
            Se déconnecter
          </button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <motion.header
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 px-8 py-3.5 flex justify-between items-center"
          style={{ background: headerBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${headerBorder}` }}>
          <div>
            <h1 className="font-semibold text-sm" style={{ color: textPrimary }}>{currentLabel}</h1>
            <p className="text-xs mt-0.5" style={{ color: accentLight }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <NotificationBell />
            <div className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: accentLight }}>
              <i className="fa-solid fa-chalkboard-user text-[12px]" />
              Instructor
            </div>
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 p-8">
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default InstructorLayout;