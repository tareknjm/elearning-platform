import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -150]);
  const opacity1 = useTransform(scrollY, [0, 400], [1, 0]);
  const scale1 = useTransform(scrollY, [0, 400], [1, 0.9]);

  const rotatingWords = ['Java', 'Python', 'React', 'DevOps', 'IA', 'Flutter', 'SQL', 'Design', 'Cloud'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % rotatingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Canvas particules avancé
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particles = Array.from({ length: 120 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      color: i % 3 === 0 ? '139,92,246' : i % 3 === 1 ? '99,102,241' : '196,181,253',
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    let animId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.pulse += p.pulseSpeed;
        const dynamicOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        const dynamicR = p.r * (0.9 + 0.1 * Math.sin(p.pulse));

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dynamicR * 4);
        gradient.addColorStop(0, `rgba(${p.color},${dynamicOpacity})`);
        gradient.addColorStop(1, `rgba(${p.color},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicR * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${dynamicOpacity})`;
        ctx.fill();
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 6).forEach(p2 => {
          const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.15 * (1 - d / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Orbe souris smooth
  useEffect(() => {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const handleMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMove);

    let rafId;
    const smoothMove = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;
      setMousePos({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(smoothMove);
    };
    smoothMove();

    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const stats = [
    { value: '50+', label: 'Formations', icon: '📚', color: '#a78bfa' },
    { value: '1K+', label: 'Apprenants', icon: '🎓', color: '#818cf8' },
    { value: '20+', label: 'Instructeurs', icon: '👨‍🏫', color: '#c084fc' },
    { value: '4.8★', label: 'Note', icon: '⭐', color: '#fbbf24' },
  ];

  const features = [
    { icon: '🎯', title: 'Formations ciblées', desc: 'Des cours adaptés à votre niveau et objectifs professionnels', gradient: 'from-violet-600 to-indigo-600' },
    { icon: '🎥', title: 'Vidéos HD', desc: 'Contenus vidéo de haute qualité réalisés par des experts', gradient: 'from-purple-600 to-violet-600' },
    { icon: '🤖', title: 'Assistant IA', desc: 'Un chatbot intelligent pour vous guider vers les bonnes formations', gradient: 'from-indigo-600 to-blue-600' },
    { icon: '🏆', title: 'Certificats', desc: 'Validez vos compétences avec des attestations officielles', gradient: 'from-amber-500 to-orange-600' },
    { icon: '📊', title: 'Quiz interactifs', desc: 'Évaluations dynamiques pour valider vos acquis', gradient: 'from-emerald-500 to-teal-600' },
    { icon: '🚀', title: 'Progression suivie', desc: 'Suivez votre évolution en temps réel sur chaque cours', gradient: 'from-pink-500 to-rose-600' },
  ];

  const steps = [
    { num: '01', title: "S'inscrire", desc: 'Créez votre compte en 30 secondes gratuitement', icon: '✍️' },
    { num: '02', title: 'Choisir', desc: "Explorez +50 formations avec l'assistant IA", icon: '🔍' },
    { num: '03', title: 'Apprendre', desc: 'Regardez les vidéos à votre rythme, où que vous soyez', icon: '🎬' },
    { num: '04', title: 'Certifier', desc: 'Réussissez le quiz et obtenez votre certificat officiel', icon: '🏆' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .glass-card:hover {
          background: rgba(139,92,246,0.08);
          border-color: rgba(139,92,246,0.4);
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 30px 60px rgba(139,92,246,0.2);
        }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #c4b5fd 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .btn-primary-home {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          box-shadow: 0 0 30px rgba(139,92,246,0.4);
          transition: all 0.3s ease;
          border-radius: 16px;
          color: white;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px;
          font-size: 18px;
          text-decoration: none;
        }
        .btn-primary-home:hover {
          box-shadow: 0 0 60px rgba(139,92,246,0.7), 0 10px 30px rgba(99,102,241,0.4);
          transform: translateY(-3px) scale(1.03);
        }
        .btn-secondary-home {
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.35);
          border-radius: 16px;
          color: white;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 40px;
          font-size: 18px;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .btn-secondary-home:hover {
          background: rgba(139,92,246,0.2);
          border-color: rgba(139,92,246,0.6);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(139,92,246,0.2);
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes scroll-indicator {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(14px); opacity: 0; }
        }
        .scroll-dot {
          animation: scroll-indicator 1.5s ease-in-out infinite;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f0c29; }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #6366f1);
          border-radius: 3px;
        }
      `}</style>

      {/* Orbe souris */}
      <div className="fixed pointer-events-none z-0"
        style={{
          width: '900px',
          height: '900px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
          left: mousePos.x - 450,
          top: mousePos.y - 450,
          transition: 'left 2s cubic-bezier(0.23, 1, 0.32, 1), top 2s cubic-bezier(0.23, 1, 0.32, 1)',
        }} />

      {/* Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Orbes décoratifs fixes */}
      <div className="fixed pointer-events-none z-0"
        style={{
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          top: '-250px', left: '-200px',
        }} />
      <div className="fixed pointer-events-none z-0"
        style={{
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          bottom: '-150px', right: '-150px',
        }} />

      {/* ===== NAVBAR ===== */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* ===== HERO ===== */}
      <motion.section
        ref={heroRef}
        style={{ y: y1, opacity: opacity1, scale: scale1 }}
        className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-10 text-sm font-semibold"
          style={{
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#c4b5fd',
            backdropFilter: 'blur(10px)',
          }}>
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#a78bfa', boxShadow: '0 0 10px #8b5cf6' }} />
          Plateforme E-Learning nouvelle génération
          <motion.span
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-2 py-0.5 rounded-full text-xs font-black"
            style={{ background: 'rgba(139,92,246,0.35)', color: '#e9d5ff' }}>
            NOUVEAU
          </motion.span>
        </motion.div>

        {/* Titre bloc */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 60, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-black text-white leading-none tracking-tighter"
            style={{
              fontSize: 'clamp(56px, 10vw, 120px)',
              textShadow: '0 0 80px rgba(139,92,246,0.3)',
            }}>
            Maîtrisez
          </motion.h1>

          {/* Mot rotatif */}
          <div style={{
            height: 'clamp(70px, 12vw, 140px)',
            overflow: 'hidden',
            perspective: '800px',
          }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentWord}
                initial={{ y: 120, opacity: 0, rotateX: -70, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
                exit={{ y: -120, opacity: 0, rotateX: 70, scale: 0.8 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="gradient-text font-black leading-none tracking-tighter block"
                style={{ fontSize: 'clamp(56px, 10vw, 120px)' }}>
                {rotatingWords[currentWord]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 60, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-black text-white leading-none tracking-tighter"
            style={{
              fontSize: 'clamp(56px, 10vw, 120px)',
              textShadow: '0 0 80px rgba(139,92,246,0.3)',
            }}>
            dès aujourd'hui
          </motion.h1>
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="text-xl max-w-2xl mb-12 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.5)' }}>
          Des formations de qualité créées par des experts. Apprenez à votre rythme,
          obtenez des{' '}
          <span style={{ color: '#c4b5fd', fontWeight: 600 }}>certificats reconnus</span>
          {' '}et boostez votre carrière.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex flex-col sm:flex-row gap-4 mb-20">

          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(
                user.role === 'ADMIN' ? '/admin/dashboard' :
                user.role === 'INSTRUCTOR' ? '/instructor/dashboard' :
                '/learner/dashboard'
              )}
              className="btn-primary-home">
              <span>Accéder à mon espace</span>
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}>
                →
              </motion.span>
            </motion.button>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn-primary-home">
                  <span>Commencer gratuitement</span>
                  <motion.span
                    animate={{ x: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}>
                    →
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/courses" className="btn-secondary-home">
                  <span>Explorer les formations</span>
                  <span>📚</span>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.08, y: -6 }}
              className="glass-card p-5 text-center cursor-default">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: i * 0.6 }}
                className="text-3xl mb-2">
                {stat.icon}
              </motion.div>
              <div className="text-3xl font-black mb-1"
                style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}80` }}>
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col items-center gap-3">
          <span className="text-xs tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>
            Découvrir
          </span>
          <div className="w-6 h-10 rounded-full flex items-start justify-center pt-2 relative"
            style={{ border: '1.5px solid rgba(139,92,246,0.4)' }}>
            <div className="scroll-dot w-1.5 h-3 rounded-full"
              style={{ background: 'linear-gradient(to bottom, #8b5cf6, #6366f1)' }} />
          </div>
        </motion.div>
      </motion.section>

      {/* ===== ÉTAPES ===== */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-5"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#c4b5fd',
              }}>
              Comment ça marche
            </motion.span>
            <h2 className="font-black text-white"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
              4 étapes vers le{' '}
              <span className="gradient-text">succès</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -12 }}
                className="glass-card p-7 text-center">

                <motion.div
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))',
                    border: '1px solid rgba(139,92,246,0.3)',
                    boxShadow: '0 0 25px rgba(139,92,246,0.15)',
                  }}>
                  {step.icon}
                </motion.div>

                <div className="text-xs font-black mb-2 tracking-widest"
                  style={{ color: 'rgba(139,92,246,0.5)', letterSpacing: '0.2em' }}>
                  ÉTAPE {step.num}
                </div>
                <h3 className="font-black text-white text-xl mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16">
            <h2 className="font-black text-white mb-4"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
              Pourquoi choisir{' '}
              <span className="gradient-text">E-Learn</span> ?
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Tout ce dont vous avez besoin pour apprendre efficacement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                whileHover={{ y: -10 }}
                onHoverStart={() => setHoveredFeature(i)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="glass-card p-7 cursor-default">

                <motion.div
                  animate={hoveredFeature === i ? {
                    scale: [1, 1.3, 1.1],
                    rotate: [0, 15, -5, 0],
                  } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl mb-5`}
                  style={{
                    boxShadow: hoveredFeature === i
                      ? '0 10px 30px rgba(139,92,246,0.4)'
                      : 'none',
                    transition: 'box-shadow 0.3s ease',
                  }}>
                  {f.icon}
                </motion.div>

                <h3 className="font-black text-white text-xl mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {f.desc}
                </p>

                <AnimatePresence>
                  {hoveredFeature === i && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="mt-4 flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: '#a78bfa' }}>
                      <span>En savoir plus</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}>
                        →
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden p-16 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.1) 50%, rgba(139,92,246,0.15) 100%)',
              border: '1px solid rgba(139,92,246,0.25)',
              backdropFilter: 'blur(20px)',
            }}>

            {/* Anneaux rotatifs décoratifs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
                style={{ border: '1px solid rgba(139,92,246,0.12)' }} />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full"
                style={{ border: '1px solid rgba(99,102,241,0.08)' }} />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full"
                style={{
                  border: '1px solid rgba(139,92,246,0.06)',
                  transform: 'translate(-50%, -50%)',
                }} />
            </div>

            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="text-7xl mb-8 relative z-10">
              🚀
            </motion.div>

            <h2 className="font-black text-white mb-5 relative z-10"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)' }}>
              Prêt à vous lancer ?
            </h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed relative z-10"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              Rejoignez{' '}
              <span style={{ color: '#c4b5fd', fontWeight: 700 }}>+1000 apprenants</span>
              {' '}et développez les compétences qui feront la différence dans votre carrière.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 relative z-10">
              {!user ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register" className="btn-primary-home">
                      Créer mon compte ✨
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/become-instructor" className="btn-primary-home">
                      👨‍🏫 Devenir instructeur
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/chatbot" className="btn-secondary-home">
                      🤖 Parler à l'assistant
                    </Link>
                  </motion.div>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(
                    user.role === 'ADMIN' ? '/admin/dashboard' :
                    user.role === 'INSTRUCTOR' ? '/instructor/dashboard' :
                    '/learner/dashboard'
                  )}
                  className="btn-primary-home">
                  Accéder à mon espace →
                </motion.button>
              )}
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-4 flex-wrap relative z-10">
              <div className="flex -space-x-3">
                {['👨‍💻', '👩‍🎓', '👨‍🏫', '👩‍💼', '🧑‍🔬', '👨‍🎨'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
                    style={{
                      background: 'rgba(139,92,246,0.25)',
                      borderColor: 'rgba(139,92,246,0.5)',
                    }}>
                    {emoji}
                  </motion.div>
                ))}
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span className="text-white font-bold text-base">+1000</span> apprenants
                nous font confiance
              </p>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: s * 0.1 }}
                    className="text-amber-400 text-xl">
                    ★
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 py-10 px-4"
        style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              <span className="text-white font-bold text-xs">EL</span>
            </div>
            <span className="font-bold text-white text-sm">E-Learn</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © 2026 E-Learn — Tous droits réservés
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Formations', to: '/courses' },
              { label: 'Assistant', to: '/chatbot' },
              { label: 'Connexion', to: '/login' },
            ].map(link => (
              <Link key={link.label} to={link.to}
                className="text-xs transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;