import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import { motion } from 'framer-motion';

const LearnerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);

  // Animation particules canvas
  useEffect(() => {
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
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
        ctx.fill();
      });
      // Lignes entre particules proches
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: '/learner/dashboard', icon: '🏠', label: 'Accueil' },
    { to: '/courses', icon: '📚', label: 'Explorer' },
    { to: '/chatbot', icon: '🤖', label: 'Assistant' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* Canvas particules */}
      <canvas ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0" />

      {/* Orbes lumineux animés */}
      <div className="fixed top-20 left-10 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite',
        }} />
      <div className="fixed bottom-20 right-10 w-80 h-80 rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          animation: 'float 10s ease-in-out infinite reverse',
        }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.4); }
          50% { box-shadow: 0 0 40px rgba(139,92,246,0.8), 0 0 60px rgba(99,102,241,0.4); }
        }
        .glass {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .glass-card {
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(139,92,246,0.4);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(139,92,246,0.2);
        }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #818cf8, #c4b5fd);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .nav-link-active {
          background: rgba(139,92,246,0.3);
          border: 1px solid rgba(139,92,246,0.5);
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/learner/dashboard" className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 0 20px rgba(139,92,246,0.5)',
              }}>
              <span className="text-white font-bold text-sm">EL</span>
            </motion.div>
            <span className="font-bold text-lg gradient-text">E-Learn</span>
          </Link>

          {/* Liens */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.to)
                    ? 'nav-link-active text-violet-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="glass flex items-center gap-2 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-sm font-medium">{user?.name}</span>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }}
              className="text-gray-400 hover:text-red-400 transition text-sm px-3 py-1.5 rounded-xl hover:bg-red-500/10">
              Quitter
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Contenu */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {children}
      </motion.main>
    </div>
  );
};

export default LearnerLayout;