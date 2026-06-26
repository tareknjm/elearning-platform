import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { login as loginService, forgotPassword, changePassword } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Modes : 'login' | 'forgot' | 'forgot-sent' | 'change-password'
  const [mode, setMode] = useState('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [changeForm, setChangeForm] = useState({ tempPassword: '', newPassword: '', confirmPassword: '' });
  const [changeError, setChangeError] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    const particles = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.3, dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4, opacity: Math.random() * 0.5 + 0.1,
      color: i % 3 === 0 ? '139,92,246' : i % 3 === 1 ? '99,102,241' : '196,181,253',
      pulse: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.02 + 0.01,
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
    setLoading(true); setError('');
    try {
      const data = await loginService(form);
      login(data);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else navigate('/courses');
    } catch { setError('Email ou mot de passe incorrect'); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setForgotError('Entrez votre email'); return; }
    setForgotLoading(true); setForgotError('');
    try {
      await forgotPassword(forgotEmail.trim());
      setMode('forgot-sent');
    } catch (err) {
      setForgotError(err?.response?.data?.message || 'Aucun compte associé à cet email');
    } finally { setForgotLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangeError('');
    if (changeForm.newPassword.length < 6) {
      setChangeError('Le nouveau mot de passe doit faire au moins 6 caractères');
      return;
    }
    if (changeForm.newPassword !== changeForm.confirmPassword) {
      setChangeError('Les mots de passe ne correspondent pas');
      return;
    }
    setChangeLoading(true);
    try {
      await changePassword(forgotEmail, changeForm.tempPassword, changeForm.newPassword);
      // Connexion automatique après changement
      const data = await loginService({ email: forgotEmail, password: changeForm.newPassword });
      login(data);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else navigate('/learner/dashboard');
    } catch (err) {
      setChangeError(err?.response?.data?.message || 'Mot de passe temporaire incorrect');
    } finally { setChangeLoading(false); }
  };

  const inputStyle = {
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '14px', color: 'white', width: '100%',
    padding: '14px 18px', fontSize: '15px', outline: 'none',
    transition: 'all 0.2s ease', boxSizing: 'border-box',
  };

  const titles = {
    'login':           { h1: 'Bon retour !',           sub: 'Connectez-vous à votre compte' },
    'forgot':          { h1: 'Mot de passe oublié',    sub: 'Recevez un nouveau mot de passe par email' },
    'forgot-sent':     { h1: 'Email envoyé !',         sub: 'Que souhaitez-vous faire ?' },
    'change-password': { h1: 'Changer le mot de passe', sub: 'Entrez votre mot de passe temporaire reçu par email' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        .login-input:focus {
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
          background: rgba(139,92,246,0.12) !important;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.25); }
        @keyframes float-orb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '-150px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'float-orb 8s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'float-orb 10s ease-in-out infinite reverse' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '460px' }}>

        {/* ── Logo + titre ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}
              style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 30px rgba(139,92,246,0.5)' }}>
              <span style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>EL</span>
            </motion.div>
          </Link>
          <AnimatePresence mode="wait">
            <motion.div key={mode}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>
                {titles[mode]?.h1}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: 0 }}>
                {titles[mode]?.sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '24px', padding: '36px' }}>

          <AnimatePresence mode="wait">

            {/* ══ LOGIN ══ */}
            {mode === 'login' && (
              <motion.div key="login"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚠️ {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', color: '#c4b5fd', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="login-input" style={inputStyle} placeholder="vous@exemple.com" />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', color: '#c4b5fd', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Mot de passe</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required
                      className="login-input" style={inputStyle} placeholder="••••••••" />
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                    <button type="button"
                      onClick={() => { setMode('forgot'); setForgotEmail(form.email); setForgotError(''); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(196,181,253,0.7)', fontSize: '13px', padding: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(196,181,253,0.7)'}>
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    style={{ width: '100%', padding: '15px', background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 0 30px rgba(139,92,246,0.35)' }}>
                    {loading ? '⏳ Connexion...' : 'Se connecter'}
                  </motion.button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>ou</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(139,92,246,0.15)' }} />
                </div>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                  Pas encore de compte ?{' '}
                  <Link to="/register" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
                    onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}>
                    S'inscrire gratuitement
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ══ FORGOT ══ */}
            {mode === 'forgot' && (
              <motion.div key="forgot"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                {forgotError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px' }}>
                    ⚠️ {forgotError}
                  </motion.div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '24px' }}>
                    🔐
                  </div>
                </div>

                <form onSubmit={handleForgot}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', color: '#c4b5fd', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Adresse email</label>
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required
                      className="login-input" style={inputStyle} placeholder="vous@exemple.com" />
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', marginBottom: 0 }}>
                      Un mot de passe temporaire vous sera envoyé par email.
                    </p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={forgotLoading}
                    style={{ width: '100%', padding: '15px', background: forgotLoading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: forgotLoading ? 'not-allowed' : 'pointer', marginBottom: '12px' }}>
                    {forgotLoading ? '⏳ Envoi...' : 'Envoyer le mot de passe temporaire'}
                  </motion.button>
                </form>

                <button onClick={() => setMode('login')}
                  style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: 'rgba(255,255,255,0.45)', fontSize: '14px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                  ← Retour à la connexion
                </button>
              </motion.div>
            )}

            {/* ══ FORGOT-SENT : choix ══ */}
            {mode === 'forgot-sent' && (
              <motion.div key="forgot-sent"
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

                {/* Icône */}
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '30px', boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}>
                  ✉️
                </motion.div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '6px' }}>
                  Mot de passe temporaire envoyé à
                </p>
                <p style={{ textAlign: 'center', color: '#c4b5fd', fontSize: '14px', fontWeight: 600, marginBottom: '28px', wordBreak: 'break-word' }}>
                  {forgotEmail}
                </p>

                {/* Deux choix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  {/* Option 1 — Changer maintenant */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setMode('change-password'); setChangeForm({ tempPassword: '', newPassword: '', confirmPassword: '' }); setChangeError(''); }}
                    style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 30px rgba(139,92,246,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span>🔑</span>
                    Changer mon mot de passe maintenant
                  </motion.button>

                  {/* Option 2 — Garder temporaire */}
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => setMode('login')}
                    style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span>🔓</span>
                    Garder le mot de passe temporaire
                  </motion.button>
                </div>

                {/* Petite note */}
                <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '16px', marginBottom: 0, lineHeight: 1.5 }}>
                  Vous pourrez changer votre mot de passe à tout moment depuis vos paramètres
                </p>
              </motion.div>
            )}

            {/* ══ CHANGE PASSWORD ══ */}
            {mode === 'change-password' && (
              <motion.div key="change-password"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                {changeError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#fca5a5', fontSize: '14px' }}>
                    ⚠️ {changeError}
                  </motion.div>
                )}

                <form onSubmit={handleChangePassword}>

                  {/* Mot de passe temporaire */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: '#c4b5fd', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                      Mot de passe temporaire reçu
                    </label>
                    <input type="password"
                      value={changeForm.tempPassword}
                      onChange={e => setChangeForm({ ...changeForm, tempPassword: e.target.value })}
                      required className="login-input" style={inputStyle}
                      placeholder="Collez le mot de passe reçu par email" />
                  </div>

                  {/* Nouveau mot de passe */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: '#c4b5fd', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                      Nouveau mot de passe
                    </label>
                    <input type="password"
                      value={changeForm.newPassword}
                      onChange={e => setChangeForm({ ...changeForm, newPassword: e.target.value })}
                      required className="login-input" style={inputStyle}
                      placeholder="Au moins 6 caractères" />

                    {/* Indicateur force */}
                    {changeForm.newPassword && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                          {[1, 2, 3].map(level => {
                            const strength = changeForm.newPassword.length >= 10 ? 3
                              : changeForm.newPassword.length >= 6 ? 2 : 1;
                            const colors = { 1: '#ef4444', 2: '#f59e0b', 3: '#10b981' };
                            return (
                              <div key={level} style={{ flex: 1, height: '3px', borderRadius: '2px', background: level <= strength ? colors[strength] : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                            );
                          })}
                        </div>
                        <p style={{ fontSize: '11px', color: changeForm.newPassword.length >= 10 ? '#10b981' : changeForm.newPassword.length >= 6 ? '#f59e0b' : '#ef4444', margin: 0 }}>
                          {changeForm.newPassword.length >= 10 ? 'Fort' : changeForm.newPassword.length >= 6 ? 'Moyen' : 'Trop court'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmation */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', color: '#c4b5fd', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                      Confirmer le nouveau mot de passe
                    </label>
                    <input type="password"
                      value={changeForm.confirmPassword}
                      onChange={e => setChangeForm({ ...changeForm, confirmPassword: e.target.value })}
                      required className="login-input"
                      style={{ ...inputStyle, borderColor: changeForm.confirmPassword && changeForm.newPassword !== changeForm.confirmPassword ? 'rgba(239,68,68,0.5)' : 'rgba(139,92,246,0.25)' }}
                      placeholder="••••••••" />
                    {changeForm.confirmPassword && changeForm.newPassword !== changeForm.confirmPassword && (
                      <p style={{ fontSize: '11px', color: '#f87171', marginTop: '6px', marginBottom: 0 }}>
                        Les mots de passe ne correspondent pas
                      </p>
                    )}
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={changeLoading}
                    style={{ width: '100%', padding: '15px', background: changeLoading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '16px', fontWeight: 700, cursor: changeLoading ? 'not-allowed' : 'pointer', boxShadow: '0 0 30px rgba(139,92,246,0.35)', marginBottom: '12px' }}>
                    {changeLoading ? '⏳ Changement...' : '✓ Changer et me connecter'}
                  </motion.button>
                </form>

                <button onClick={() => setMode('forgot-sent')}
                  style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: 'rgba(255,255,255,0.45)', fontSize: '14px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>
                  ← Retour
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Lien retour accueil */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            ← Retour à l'accueil
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;