import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getLinks = () => {
    if (!user) return [
      { to: '/', label: 'Accueil' },
      { to: '/chatbot', label: '🤖 Assistant' },
    ];
    if (user.role === 'ADMIN') return [
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/users', label: 'Utilisateurs' },
      { to: '/admin/courses', label: 'Formations' },
    ];
    if (user.role === 'INSTRUCTOR') return [
      { to: '/instructor/dashboard', label: 'Mes formations' },
      { to: '/instructor/analytics', label: '📊 Analytics' },
      { to: '/instructor/create-course', label: '+ Nouvelle' },
      { to: '/chatbot', label: '🤖 Assistant' },
    ];
    if (user.role === 'LEARNER') return [
      { to: '/learner/dashboard', label: 'Mes cours' },
      { to: '/courses', label: 'Explorer' },
      { to: '/chatbot', label: '🤖 Assistant' },
    ];
    return [];
  };

  const getRoleBadge = () => {
    if (user?.role === 'ADMIN') return <span className="badge-admin">Admin</span>;
    if (user?.role === 'INSTRUCTOR') return <span className="badge-instructor">Instructor</span>;
    if (user?.role === 'LEARNER') return <span className="badge-learner">Learner</span>;
  };

  return (
    <nav className={`sticky top-0 z-50 px-4 transition-all duration-300 ${
      isHome
        ? 'bg-transparent border-b border-white/10'
        : 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm'
    }`}>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? isHome
                      ? 'bg-white/10 text-white'
                      : 'bg-primary-50 text-primary-600'
                    : isHome
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {getRoleBadge()}
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
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium my-0.5 ${
                  isActive(link.to)
                    ? isHome ? 'bg-white/10 text-white' : 'bg-primary-50 text-primary-600'
                    : isHome ? 'text-white/70 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg mt-1">
                Déconnexion
              </button>
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