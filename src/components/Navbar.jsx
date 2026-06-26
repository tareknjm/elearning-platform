import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import NotificationBell from './NotificationBell';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Icons = {
  bot: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  analytics: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  explore: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastScrollY.current;

        // Scrolle vers le bas et assez loin du haut → cacher
        if (diff > 6 && currentY > 80) {
          setVisible(false);
          setMenuOpen(false);
        }
        // Scrolle vers le haut → montrer
        else if (diff < -4) {
          setVisible(true);
        }

        setScrolled(currentY > 20);
        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getLinks = () => {
    if (!user) return [];
    if (user.role === 'ADMIN') return [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'Utilisateurs' },
      { to: '/admin/courses', label: 'Formations' },
    ];
    if (user.role === 'INSTRUCTOR') return [
      { to: '/instructor/dashboard', label: 'Mes formations' },
      { to: '/instructor/analytics', label: 'Analytics', icon: Icons.analytics },
      { to: '/instructor/create-course', label: 'Nouvelle', icon: Icons.plus },
      { to: '/chatbot', label: 'Assistant', icon: Icons.bot },
    ];
    if (user.role === 'LEARNER') return [
      { to: '/learner/dashboard', label: 'Mes cours' },
      { to: '/courses', label: 'Explorer', icon: Icons.explore },
      { to: '/pricing', label: 'Premium', icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
      { to: '/chatbot', label: 'Assistant', icon: Icons.bot },
    ];
    return [];
  };

  const getRoleBadge = () => {
    if (user?.role === 'ADMIN') return <span className="badge-admin">Admin</span>;
    if (user?.role === 'INSTRUCTOR') return <span className="badge-instructor">Instructor</span>;
    if (user?.role === 'LEARNER') return <span className="badge-learner">Learner</span>;
  };

  const getPremiumBadge = () => {
    if (user?.role !== 'LEARNER') return null;
    if (user.plan === 'PREMIUM') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.15))',
            border: '1px solid rgba(251,191,36,0.35)',
            color: '#fbbf24',
          }}>
          <FontAwesomeIcon icon={faCrown} style={{ fontSize: 10 }} />
          PREMIUM
        </span>
      );
    }
    return (
      <Link to="/pricing"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition"
        style={{
          background: isHome ? 'rgba(255,255,255,0.08)' : 'rgba(139,92,246,0.08)',
          border: `1px solid ${isHome ? 'rgba(255,255,255,0.12)' : 'rgba(139,92,246,0.2)'}`,
          color: isHome ? 'rgba(255,255,255,0.6)' : '#6366f1',
        }}>
        <FontAwesomeIcon icon={faCrown} style={{ fontSize: 10, opacity: 0.6 }} />
        Passer Premium
      </Link>
    );
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4"
      style={{
        // Slide up/down avec transform
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s, border-color 0.3s, box-shadow 0.3s',

        backdropFilter: scrolled || !isHome ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled || !isHome ? 'blur(20px) saturate(180%)' : 'none',

        background: isHome
          ? scrolled
            ? 'rgba(8,7,26,0.88)'
            : 'transparent'
          : 'rgba(255,255,255,0.92)',

        borderBottom: isHome
          ? scrolled
            ? '1px solid rgba(139,92,246,0.2)'
            : '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(229,231,235,1)',

        boxShadow: scrolled
          ? isHome
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 2px 12px rgba(0,0,0,0.08)'
          : 'none',
      }}>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}>
              <span className="text-white font-bold text-sm">EL</span>
            </div>
            <span className={`font-bold text-lg tracking-tight ${isHome ? 'text-white' : 'text-gray-900'}`}>
              E<span className={isHome ? 'text-violet-400' : 'text-primary-600'}>-Learn</span>
            </span>
          </Link>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">
            {getLinks().map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive(link.to)
                    ? isHome
                      ? 'bg-white/10 text-white'
                      : 'bg-primary-50 text-primary-600'
                    : isHome
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {getRoleBadge()}
                {getPremiumBadge()}
                <NotificationBell />
                <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 ${
                  isHome ? 'bg-white/10' : 'bg-gray-50'
                }`}>
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${isHome ? 'text-white' : 'text-gray-700'}`}>
                    {user.name}
                  </span>
                </div>
                <button onClick={handleLogout}
                  className={`text-sm transition px-3 py-1.5 rounded-lg ${
                    isHome
                      ? 'text-white/50 hover:text-red-400 hover:bg-red-500/10'
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className={`text-sm font-medium transition px-4 py-2 ${
                    isHome
                      ? 'text-white/70 hover:text-white'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}>
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: isHome ? 'white' : '#374151' }}
            onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`w-5 h-0.5 mb-1 transition-all ${
              isHome ? 'bg-white' : 'bg-gray-600'
            } ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-5 h-0.5 mb-1 ${
              isHome ? 'bg-white' : 'bg-gray-600'
            } ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 transition-all ${
              isHome ? 'bg-white' : 'bg-gray-600'
            } ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className={`md:hidden pb-4 pt-2 border-t ${
            isHome ? 'border-white/10' : 'border-gray-100'
          }`}>
            {getLinks().map((link) => (
              <Link key={link.to} to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium my-0.5 ${
                  isActive(link.to)
                    ? isHome ? 'bg-white/10 text-white' : 'bg-primary-50 text-primary-600'
                    : isHome ? 'text-white/70 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {link.icon}
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="px-4 py-2">{getPremiumBadge()}</div>
                <button onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg mt-1">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/register"
                onClick={() => setMenuOpen(false)}
                className="block mt-2 btn-primary text-center text-sm py-2.5">
                S'inscrire
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;