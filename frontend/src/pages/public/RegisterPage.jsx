import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'LEARNER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    const particles = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
      color: i % 3 === 0 ? '139,92,246' : i % 3 === 1 ? '99,102,241' : '196,181,253',
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.pulse += p.pulseSpeed;
        const o = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        const r = p.r * (0.9 + 0.1 * Math.sin(p.pulse));
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4);
        g.addColorStop(0, `rgba(${p.color},${o})`);
        g.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${o})`; ctx.fill();
      });
      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 5).forEach(p2 => {
          const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register(form);
      login(data);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else navigate('/learner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '14px',
    color: 'white',
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        .reg-input:focus {
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
          background: rgba(139,92,246,0.12) !important;
        }
        .reg-input::placeholder { color: rgba(255,255,255,0.25); }
        .reg-input option { background: #1a1040; color: white; }
        @keyframes float-orb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>

      {/* Canvas particules */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* Orbes */}
      <div style={{
        position: 'fixed', top: '-150px', right: '-100px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'float-orb 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'fixed', bottom: '-100px', left: '-100px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
        animation: 'float-orb 11s ease-in-out infinite reverse',
      }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '480px',
        }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              style={{
                width: '60px', height: '60px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 0 30px rgba(139,92,246,0.5)',
              }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>EL</span>
            </motion.div>
          </Link>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, margin: '0 0 6px' }}>
            Créer un compte
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', margin: 0 }}>
            Rejoignez notre communauté d'apprenants
          </p>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '24px',
            padding: '36px',
          }}>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#fca5a5',
                fontSize: '14px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nom */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', color: '#c4b5fd',
                fontSize: '13px', fontWeight: 600, marginBottom: '8px',
              }}>
                Nom complet
              </label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} required
                className="reg-input"
                style={inputStyle}
                placeholder="Ahmed Benali"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', color: '#c4b5fd',
                fontSize: '13px', fontWeight: 600, marginBottom: '8px',
              }}>
                Email
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required
                className="reg-input"
                style={inputStyle}
                placeholder="vous@exemple.com"
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block', color: '#c4b5fd',
                fontSize: '13px', fontWeight: 600, marginBottom: '8px',
              }}>
                Mot de passe
              </label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} required
                className="reg-input"
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            {/* Devenir instructeur */}
<p style={{
  fontSize: '13px',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '10px',
}}>
  Vous souhaitez enseigner ?{' '}
  <Link to="/become-instructor" style={{
    color: '#a78bfa', fontWeight: 700, textDecoration: 'none',
  }}
    onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
    onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}>
    Soumettre une candidature →
  </Link>
</p>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(139,92,246,0.6)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                marginTop: '10px',
                background: loading
                  ? 'rgba(139,92,246,0.5)'
                  : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                border: 'none', borderRadius: '14px',
                color: 'white', fontSize: '16px', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 30px rgba(139,92,246,0.35)',
                transition: 'all 0.2s ease',
              }}>
              {loading ? '⏳ Création...' : 'Créer mon compte'}
            </motion.button>
          </form>

          {/* Séparateur */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>ou</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{
              color: '#a78bfa', fontWeight: 600, textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
              onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}>
              Se connecter
            </Link>
          </p>
        </motion.div>

        {/* Lien retour */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{
            color: 'rgba(255,255,255,0.3)', fontSize: '13px',
            textDecoration: 'none', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;