import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  {
    to: '/courses', label: 'Explorer',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  },
  {
    to: '/learner/dashboard', label: 'Mes formations',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  },
  {
    to: '/learner/video-calls', label: 'Mes appels', premiumGated: true,
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  },
  {
    to: '/chatbot', label: 'Assistant',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
];

const LearnerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const canvasRef = useRef(null);
  const isActive = (path) => location.pathname === path;

  const isPremium = user?.plan?.toUpperCase() === 'PREMIUM';

  // ── Popup premium au premier accès ──


useEffect(() => {
  if (!user) return;
  if (!isPremium) {
    const key = `premium_popup_${user.userId}`;
    if (!localStorage.getItem(key)) {
      const timer = setTimeout(() => {
        localStorage.setItem(key, 'true');
        setShowWelcomeModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  } else {
    // User est premium → on s'assure que la clé existe
    // pour ne pas revoir le popup si le plan expire et se renouvelle
    const key = `premium_popup_${user.userId}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, 'true');
    }
  }
}, [user, isPremium]);

  // ── Particules (mode sombre uniquement) ──
  useEffect(() => {
    if (!dark) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', handleResize); };
  }, [dark]);

  const bgStyle = dark
    ? { background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' }
    : { background: '#f8fafc' };

  const navBg = dark ? 'rgba(15,12,41,0.85)' : 'rgba(255,255,255,0.95)';
  const navBorder = dark ? 'rgba(139,92,246,0.2)' : '#e5e7eb';
  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.5)' : '#6b7280';
  const accent = '#8b5cf6';
  const accentLight = dark ? '#c4b5fd' : '#7c3aed';

  return (
    <div className="min-h-screen relative overflow-hidden" style={bgStyle}>

      {/* Canvas particules */}
      {dark && <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />}

      {/* Orbes */}
      {dark && (
        <>
          <div className="fixed top-20 left-10 w-96 h-96 rounded-full pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
          <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full pointer-events-none z-0"
            style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
        </>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .gradient-text {
          background: linear-gradient(135deg,#a78bfa,#818cf8,#c4b5fd);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-50 px-6"
        style={{ background: navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${navBorder}` }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/learner/dashboard" className="flex items-center gap-2.5">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: dark ? '0 0 20px rgba(139,92,246,0.5)' : 'none' }}>
              <span className="text-white font-bold text-sm">EL</span>
            </motion.div>
            {dark
              ? <span className="font-bold text-lg gradient-text">E-Learn</span>
              : <span className="font-bold text-lg" style={{ color: '#111827' }}>E-Learn</span>
            }
          </Link>

          {/* Liens nav */}
          <div className="hidden md:flex items-center gap-1">
{links.map((link) => (
  <Link key={link.to} to={link.to}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative"
    style={isActive(link.to) ? {
      background: dark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.08)',
      border: `1px solid ${dark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.2)'}`,
      color: accentLight,
    } : { color: textSub }}
    onClick={e => {
      if (link.premiumGated && !isPremium) {
        e.preventDefault();
        setShowWelcomeModal(true);
      }
    }}
    onMouseEnter={e => { if (!isActive(link.to)) { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.06)'; e.currentTarget.style.color = textPrimary; } }}
    onMouseLeave={e => { if (!isActive(link.to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textSub; } }}>
    {link.icon}
    <span>{link.label}</span>
    {link.premiumGated && (
      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0"
        style={{
          background: isPremium
            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
            : 'rgba(139,92,246,0.25)',
          color: isPremium ? 'white' : '#a78bfa',
          border: isPremium ? 'none' : '1px solid rgba(139,92,246,0.4)',
          boxShadow: isPremium ? '0 2px 8px rgba(245,158,11,0.35)' : 'none',
        }}>
        {isPremium ? '⭐ PRO' : '🔒 PRO'}
      </span>
    )}
  </Link>
))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />

            {/* Profil + badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
              }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium" style={{ color: textPrimary }}>{user?.name}</span>
              {isPremium && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                  ⭐ PREMIUM
                </motion.span>
              )}
            </div>

            <button onClick={() => { logout(); navigate('/login'); }}
              className="text-sm px-3 py-1.5 rounded-xl transition"
              style={{ color: textSub }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = textSub; e.currentTarget.style.background = 'transparent'; }}>
              Quitter
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Contenu principal */}
      <motion.main
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {children}
      </motion.main>

      {/* ── Modal Premium bienvenue ── */}
<AnimatePresence>
  {showWelcomeModal && (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,7,26,0.85)', backdropFilter: 'blur(10px)' }}
      onClick={() => setShowWelcomeModal(false)}>

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 12 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[820px] rounded-3xl overflow-hidden flex"
        style={{
          background: 'linear-gradient(160deg,#12103a 0%,#16123f 60%,#0f0a28 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 40px 100px rgba(139,92,246,0.3)',
          maxHeight: '90vh',
        }}>

        {/* ── COLONNE GAUCHE : visuel ── */}
        <div className="relative w-[300px] flex-shrink-0 flex flex-col items-center justify-center p-8 overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#1e1654 0%,#16123f 50%,#0f0a28 100%)' }}>

          {/* Cercles déco */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.25) 0%,transparent 70%)' }} />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)' }} />

          {/* Logo animé */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative z-10"
            style={{
              background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
              boxShadow: '0 0 50px rgba(139,92,246,0.5), 0 0 100px rgba(139,92,246,0.2)',
            }}>
            <span style={{ fontSize: 36 }}>⭐</span>
          </motion.div>

          <h3 className="font-black text-white text-2xl text-center mb-2 relative z-10"
            style={{ letterSpacing: '-0.02em' }}>
            Passez à<br />Premium
          </h3>
          <p className="text-xs text-center relative z-10"
            style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Débloquez tout le potentiel de votre apprentissage
          </p>

          {/* Stats visuelles */}
          <div className="flex flex-col gap-2.5 mt-8 w-full relative z-10">
            {[
              { value: '100+', label: 'Formations' },
              { value: '∞', label: 'Accès illimité' },
              { value: '1-on-1', label: 'Sessions privées' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.18)' }}>
                <span className="font-black text-sm" style={{ color: '#a78bfa', minWidth: 40 }}>{s.value}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Séparateur vertical */}
        <div className="w-px flex-shrink-0"
          style={{ background: 'linear-gradient(to bottom,transparent,rgba(139,92,246,0.25),transparent)' }} />

        {/* ── COLONNE DROITE : contenu ── */}
        <div className="flex-1 p-7 flex flex-col overflow-y-auto relative">

          {/* Bouton fermer */}
          <button onClick={() => setShowWelcomeModal(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Header */}
          <div className="mb-5 pr-8">
            <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(139,92,246,0.8)' }}>
              🎉 Bienvenue sur E-Learn
            </p>
            <h2 className="font-black text-white text-xl leading-tight mb-1.5"
              style={{ letterSpacing: '-0.01em' }}>
              Bonjour, {user?.name?.split(' ')[0]} !
            </h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
              Vous êtes en version <strong style={{ color: '#a78bfa' }}>Gratuite</strong>.
              Passez à <strong style={{ color: '#fbbf24' }}>Premium</strong> pour accéder à tout le contenu.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-5">
            {[
              { icon: '🎬', text: 'Toutes les vidéos débloquées' },
              { icon: '📹', text: 'Sessions 1-on-1 avec les instructeurs' },
              { icon: '♾️', text: 'Formations illimitées incluses' },
              { icon: '🏆', text: 'Certificats vérifiés' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.12)' }}>
                <span style={{ fontSize: 15 }}>{f.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{f.text}</span>
                <div className="ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.2)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3" className="w-2.5 h-2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Prix */}
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => {}}
              className="flex-1 p-3 rounded-2xl text-left transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Mensuel</p>
              <p className="font-black text-white text-lg leading-none">
                19€<span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>/mois</span>
              </p>
            </button>
            <div className="flex-1 p-3 rounded-2xl text-left relative"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)' }}>
              <span className="absolute -top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: '#10b981', color: 'white' }}>-21%</span>
              <p className="text-[10px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Annuel</p>
              <p className="font-black text-white text-lg leading-none">
                15€<span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>/mois</span>
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setShowWelcomeModal(false); navigate('/learner/payment'); }}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 8px 24px rgba(139,92,246,0.45)' }}>
              ✨ Passer à Premium maintenant
            </motion.button>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
              Continuer en version gratuite
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default LearnerLayout;