import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

/* ─────────────────────────────────────────────
   Données
───────────────────────────────────────────── */
const ROTATING_WORDS = ['Programmation', 'Cuisine', 'Sport', 'Design', 'IA', 'Flutter', 'SQL', 'Cloud'];

const STATS = [
  { value: '50+',  label: 'Formations',   icon: '📚', color: '#a78bfa' },
  { value: '1K+',  label: 'Apprenants',   icon: '🎓', color: '#818cf8' },
  { value: '20+',  label: 'Instructeurs', icon: '👨‍🏫', color: '#c084fc' },
  { value: '4.8★', label: 'Note',         icon: '⭐', color: '#fbbf24' },
];

const FEATURES = [
  { icon: '🎯', title: 'Formations ciblées',  desc: 'Des cours adaptés à votre niveau et objectifs professionnels', gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)' },
  { icon: '🎥', title: 'Vidéos HD',            desc: 'Contenus vidéo de haute qualité réalisés par des experts',      gradient: 'linear-gradient(135deg,#9333ea,#7c3aed)' },
  { icon: '🤖', title: 'Assistant IA',         desc: 'Un chatbot intelligent pour vous guider vers les bonnes formations', gradient: 'linear-gradient(135deg,#4f46e5,#2563eb)' },
  { icon: '🏆', title: 'Certificats',          desc: 'Validez vos compétences avec des attestations officielles',     gradient: 'linear-gradient(135deg,#d97706,#ea580c)' },
  { icon: '📊', title: 'Quiz interactifs',     desc: 'Évaluations dynamiques pour valider vos acquis',               gradient: 'linear-gradient(135deg,#059669,#0d9488)' },
  { icon: '🚀', title: 'Progression suivie',   desc: 'Suivez votre évolution en temps réel sur chaque cours',        gradient: 'linear-gradient(135deg,#db2777,#e11d48)' },
];

const STEPS = [
  { num: '01', title: "S'inscrire",  desc: 'Créez votre compte en 30 secondes gratuitement',           icon: '✍️' },
  { num: '02', title: 'Choisir',     desc: "Explorez +50 formations avec l'assistant IA",              icon: '🔍' },
  { num: '03', title: 'Apprendre',   desc: 'Regardez les vidéos à votre rythme, où que vous soyez',   icon: '🎬' },
  { num: '04', title: 'Certifier',   desc: 'Réussissez le quiz et obtenez votre certificat officiel', icon: '🏆' },
];

/* Images Unsplash – thème éducation / tech / violet */
const HERO_VIDEO_POSTER =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1600&q=80'; // laptop code purple light
const FEATURE_IMAGES = [
  'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80', // code screen dark
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80', // video call HD
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80', // AI robot glow
  'https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=800&q=80', // diploma scroll gold
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', // analytics laptop
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', // student studying progress
];

/* ─────────────────────────────────────────────
   Composant
───────────────────────────────────────────── */
const HomePage = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const heroRef     = useRef(null);
  const videoRef    = useRef(null);

  const [currentWord,    setCurrentWord]    = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [videoLoaded,    setVideoLoaded]    = useState(false);
  const [mousePos,       setMousePos]       = useState({ x: 0, y: 0 });
  const [scrolled,       setScrolled]       = useState(false); 

  const { scrollY } = useScroll();
  const heroY       = useTransform(scrollY, [0, 600],  [0, -180]);
  const heroOpacity = useTransform(scrollY, [0, 500],  [1, 0]);
  const heroScale   = useTransform(scrollY, [0, 500],  [1, 0.92]);

  /* Mot rotatif */
  useEffect(() => {
    const id = setInterval(() => setCurrentWord(p => (p + 1) % ROTATING_WORDS.length), 2000);
    return () => clearInterval(id);
  }, []);

  /* Orbe souris */
  useEffect(() => {
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty, id;
    const onMove = e => { tx = e.clientX; ty = e.clientY; };
    const loop   = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      setMousePos({ x: cx, y: cy });
      id = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove);
    loop();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(id); };
  }, []);

  useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);

  const dashboardPath =
    user?.role === 'ADMIN'       ? '/admin/dashboard'      :
    user?.role === 'INSTRUCTOR'  ? '/instructor/dashboard' :
    '/learner/dashboard';

  /* ─── RENDU ─── */
  return (
    <div style={{
      background: `
  linear-gradient(160deg,
    #08071a 0%,
    #0e0c2e 12%,
    #12103a 25%,
    #16123f 38%,
    #1a1040 50%,
    #140d35 62%,
    #0f0a28 75%,
    #0a0820 88%,
    #080718 100%
  )
`,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      overflowX: 'hidden',
    }}>

      {/* ── Global styles ── */}
      <style>{`
        .apple-glass {
          background: rgba(255,255,255,0.045);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
        }
        .apple-glass-hover {
          transition: background .35s, border-color .35s, transform .4s cubic-bezier(.23,1,.32,1), box-shadow .4s;
        }
        .apple-glass-hover:hover {
          background: rgba(139,92,246,0.1);
          border-color: rgba(139,92,246,0.35);
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 32px 64px rgba(99,60,255,0.22);
        }
        .shimmer-text {
          background: linear-gradient(120deg,#c4b5fd 0%,#818cf8 40%,#a78bfa 70%,#e0d7ff 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 220% center; }
        }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 38px; border-radius: 980px;
          background: linear-gradient(135deg,#8b5cf6,#6366f1);
          color: #fff; font-weight: 700; font-size: 17px;
          text-decoration: none; letter-spacing: -.01em;
          box-shadow: 0 0 40px rgba(139,92,246,.45);
          transition: all .3s ease;
        }
        .cta-primary:hover {
          box-shadow: 0 0 70px rgba(139,92,246,.7), 0 10px 35px rgba(99,102,241,.4);
          transform: translateY(-3px) scale(1.04);
        }
        .cta-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 38px; border-radius: 980px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,.88); font-weight: 600; font-size: 17px;
          text-decoration: none; letter-spacing: -.01em;
          backdrop-filter: blur(12px);
          transition: all .3s ease;
        }
        .cta-secondary:hover {
          background: rgba(139,92,246,.18);
          border-color: rgba(139,92,246,.5);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(139,92,246,.2);
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes scroll-dot { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(14px);opacity:0} }
        .scroll-dot { animation: scroll-dot 1.6s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #08071a; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom,#8b5cf6,#6366f1); border-radius: 4px; }
        section + section {
  margin-top: -2px;
}
.section-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(139,92,246,.15) 30%, rgba(99,60,255,.2) 50%, rgba(139,92,246,.15) 70%, transparent);
  margin: 0 auto;
  max-width: 1000px;
}
  body { overflow-x: hidden; }
      `}</style>

      {/* ── Orbe souris ── */}
      <div className="fixed pointer-events-none z-0" style={{
        width: 1000, height: 1000, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%)',
        left: mousePos.x - 500, top: mousePos.y - 500,
        transition: 'left 2s cubic-bezier(.23,1,.32,1), top 2s cubic-bezier(.23,1,.32,1)',
      }} />

      {/* ── Orbes fixes ── */}
      {[
        { s: 800, t: -300, l: -200, c: '139,92,246', o: .09 },
        { s: 600, b: -200, r: -150, c: '99,102,241',  o: .07 },
        { s: 400, t: '40%', l: '60%', c: '167,139,250', o: .05 },
      ].map((o, i) => (
        <div key={i} className="fixed pointer-events-none z-0" style={{
          width: o.s, height: o.s, borderRadius: '50%',
          background: `radial-gradient(circle,rgba(${o.c},${o.o}) 0%,transparent 70%)`,
          top: o.t, bottom: o.b, left: o.l, right: o.r,
        }} />
      ))}

      {/* ── Orbes de section (background harmonique) ── */}
{[
  { s: 700, top: '18%',  left: '-10%',  c: '99,60,255',   o: .06 },
  { s: 600, top: '35%',  right: '-8%',  c: '139,92,246',  o: .055 },
  { s: 550, top: '52%',  left: '15%',   c: '79,70,229',   o: .05 },
  { s: 500, top: '68%',  right: '5%',   c: '167,139,250', o: .045 },
  { s: 480, top: '82%',  left: '-5%',   c: '99,102,241',  o: .05 },
  { s: 400, top: '93%',  right: '20%',  c: '139,92,246',  o: .04 },
].map((o, i) => (
  <div key={`section-orb-${i}`} className="absolute pointer-events-none z-0" style={{
    width: o.s, height: o.s, borderRadius: '50%',
    background: `radial-gradient(circle, rgba(${o.c},${o.o}) 0%, transparent 70%)`,
    top: o.top, left: o.left, right: o.right,
  }} />
))}

      {/* ── Navbar sticky ── */}
  <Navbar />


      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <motion.section
        ref={heroRef}
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative z-0 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 pb-20"
      >
        {/* Image de fond hero avec overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-none pointer-events-none">
          <img
            src={HERO_VIDEO_POSTER}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: .13, filter: 'saturate(1.4) hue-rotate(-10deg)' }}
            loading="eager"
          />
          {/* Dégradé de masque */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(8,7,26,0.55) 0%, rgba(8,7,26,0.2) 40%, rgba(8,7,26,0.7) 85%, rgba(8,7,26,1) 100%)',
          }} />
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -24, scale: .85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: .1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10 text-sm font-semibold relative z-10"
          style={{ background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.3)', color: '#c4b5fd', backdropFilter: 'blur(12px)' }}
        >
          <motion.span
            animate={{ scale: [1,1.5,1], opacity: [.7,1,.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: '#a78bfa', boxShadow: '0 0 10px #8b5cf6' }}
          />
          Plateforme E-Learning nouvelle génération
          <span className="px-2 py-0.5 rounded-full text-xs font-black"
            style={{ background: 'rgba(139,92,246,.35)', color: '#e9d5ff' }}>
            NOUVEAU
          </span>
        </motion.div>

        {/* Titre */}
        <div className="mb-10 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2, duration: .85, ease: [.16,1,.3,1] }}
            className="font-black text-white leading-none tracking-tighter"
            style={{ fontSize: 'clamp(52px,9vw,112px)', textShadow: '0 0 80px rgba(139,92,246,.25)' }}
          >
            Maîtrisez
          </motion.h1>

          <div style={{ height: 'clamp(64px,11vw,128px)', overflow: 'hidden', perspective: 800, width: '100%', maxWidth: '100vw' }}>
            <AnimatePresence mode="wait">
              <motion.h1
                key={currentWord}
                initial={{ y: 110, opacity: 0, rotateX: -65, scale: .85 }}
                animate={{ y: 0,   opacity: 1, rotateX: 0,   scale: 1 }}
                exit={{   y: -110, opacity: 0, rotateX: 65,  scale: .85 }}
                transition={{ duration: .48, ease: [.16,1,.3,1] }}
                className="shimmer-text font-black leading-none tracking-tighter block"
                style={{ fontSize: 'clamp(52px,9vw,112px)' }}
              >
                {ROTATING_WORDS[currentWord]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .4, duration: .85, ease: [.16,1,.3,1] }}
            className="font-black text-white leading-none tracking-tighter"
            style={{ fontSize: 'clamp(52px,9vw,112px)', textShadow: '0 0 80px rgba(139,92,246,.25)' }}
          >
            dès aujourd'hui
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .6 }}
          className="text-xl max-w-2xl mb-12 leading-relaxed relative z-10"
          style={{ color: 'rgba(255,255,255,.48)', letterSpacing: '-.01em' }}
        >
          Des formations de qualité créées par des experts. Apprenez à votre rythme,
          obtenez des{' '}
          <span style={{ color: '#c4b5fd', fontWeight: 600 }}>certificats reconnus</span>
          {' '}et boostez votre carrière.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .75 }}
          className="flex flex-col sm:flex-row gap-4 mb-20 relative z-10"
        >
          {user ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
              onClick={() => navigate(dashboardPath)} className="cta-primary">
              Accéder à mon espace
              <motion.span animate={{ x: [0,6,0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
            </motion.button>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
                <Link to="/register" className="cta-primary">
                  Commencer gratuitement
                  <motion.span animate={{ x: [0,6,0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
                <Link to="/courses" className="cta-secondary">Explorer les formations 📚</Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mb-20 relative z-10"
        >
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, scale: .5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1 + i * .1, type: 'spring', stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.08, y: -6 }}
              className="apple-glass p-5 text-center cursor-default apple-glass-hover"
            >
              <motion.div
                animate={{ rotate: [0,10,-10,0] }}
                transition={{ repeat: Infinity, duration: 4, delay: i * .6 }}
                className="text-3xl mb-2"
              >{s.icon}</motion.div>
              <div className="text-3xl font-black mb-1"
                style={{ color: s.color, textShadow: `0 0 20px ${s.color}80` }}>
                {s.value}
              </div>
              <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,.38)' }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="flex flex-col items-center gap-3 relative z-10">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.2)' }}>Découvrir</span>
          <div className="w-6 h-10 rounded-full flex items-start justify-center pt-2"
            style={{ border: '1.5px solid rgba(139,92,246,.35)' }}>
            <div className="scroll-dot w-1.5 h-3 rounded-full"
              style={{ background: 'linear-gradient(to bottom,#8b5cf6,#6366f1)' }} />
          </div>
        </motion.div>
      </motion.section>
      <div className="section-divider" />
      {/* ═══════════════════════════════════════
          BENTO – SHOWCASE VISUEL (style Apple)
      ═══════════════════════════════════════ */}
      {/* ═══════════════════════════════════════ */}
<section className="relative z-10 py-28 px-4">
  <div className="max-w-7xl mx-auto">

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="text-center mb-16"
    >
      <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-5"
        style={{ background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.25)', color: '#c4b5fd' }}>
        Ce que vous vivrez
      </span>
      <h2 className="font-black text-white" style={{ fontSize: 'clamp(36px,6vw,64px)' }}>
        Apprenez autrement.<br />
        <span className="shimmer-text">Vraiment.</span>
      </h2>
    </motion.div>

    {/* Bento grid */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4" style={{ gridAutoRows: '260px' }}>

      {/* Grande carte gauche — vidéo loopée */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
        className="md:col-span-7 row-span-2 relative overflow-hidden rounded-3xl group cursor-default"
        style={{ border: '1px solid rgba(255,255,255,.07)' }}
      >
        <video
          autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'saturate(1.3) brightness(.65)' }}
        >
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        </video>
        {/* Overlay dégradé */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(8,7,26,.97) 0%, rgba(8,7,26,.45) 50%, rgba(99,60,255,.12) 100%)',
        }} />
        {/* Pill "live" */}
        <div className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(139,92,246,.25)', border: '1px solid rgba(139,92,246,.45)', color: '#e9d5ff', backdropFilter: 'blur(12px)' }}>
          <motion.span
            animate={{ opacity: [1, .3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#a78bfa' }}
          />
          IA · Recommandation personnalisée
        </div>
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <span className="text-4xl mb-3">🤖</span>
          <h3 className="text-2xl font-black text-white mb-2">Assistant IA intégré</h3>
          <p style={{ color: 'rgba(255,255,255,.52)', maxWidth: 400, lineHeight: 1.65, fontSize: 15 }}>
            Un chatbot analyse votre profil et vous recommande les formations parfaites pour vos objectifs.
          </p>
          <motion.div
            whileHover={{ x: 6 }}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold w-fit"
            style={{ color: '#a78bfa' }}
          >
            <span>Essayer maintenant</span>
            <span>→</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Carte haut-droite — formation code */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: .1, duration: .7 }}
        className="md:col-span-5 relative overflow-hidden rounded-3xl group cursor-default"
        style={{ border: '1px solid rgba(255,255,255,.07)' }}
      >
        <img
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80"
          alt="code formation"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'saturate(1.2) brightness(.55)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(145deg, rgba(99,102,241,.6) 0%, rgba(8,7,26,.8) 100%)',
        }} />
        {/* Fausse fenêtre code */}
        <div className="absolute top-5 right-5 left-5 rounded-xl overflow-hidden"
          style={{ background: 'rgba(8,7,26,.7)', border: '1px solid rgba(99,102,241,.3)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            ))}
            <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,.3)' }}>main.py</span>
          </div>
          <div className="px-3 py-2 font-mono text-xs leading-5" style={{ color: 'rgba(167,139,250,.9)' }}>
            <span style={{ color: '#818cf8' }}>def</span>{' '}
            <span style={{ color: '#34d399' }}>train_model</span>
            <span style={{ color: 'rgba(255,255,255,.5)' }}>(data):</span>
          </div>
        </div>
        <div className="absolute inset-0 p-7 flex flex-col justify-end">
          <span className="text-3xl mb-2">🎯</span>
          <h3 className="text-xl font-black text-white mb-1">+50 formations ciblées</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,.48)' }}>
            Du débutant à l'expert, chaque niveau couvert par nos instructeurs certifiés.
          </p>
        </div>
      </motion.div>

      {/* Carte bas-droite — certificat avec mockup */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: .2, duration: .7 }}
        className="md:col-span-5 relative overflow-hidden rounded-3xl group cursor-default"
        style={{ border: '1px solid rgba(255,255,255,.07)' }}
      >
        <img
          src="https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=800&q=80"
          alt="certificat"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'saturate(1.3) brightness(.5)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(145deg, rgba(217,119,6,.5) 0%, rgba(8,7,26,.85) 100%)',
        }} />
        {/* Badge flottant */}
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="absolute top-5 right-5 px-3 py-2 rounded-2xl text-center"
          style={{
            background: 'rgba(217,119,6,.25)',
            border: '1px solid rgba(251,191,36,.35)',
            backdropFilter: 'blur(12px)',
          }}>
          <div className="text-xl">🏆</div>
          <div className="text-xs font-black mt-0.5" style={{ color: '#fbbf24' }}>CERTIFIÉ</div>
        </motion.div>
        <div className="absolute inset-0 p-7 flex flex-col justify-end">
          <h3 className="text-xl font-black text-white mb-1">Certificats officiels</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,.48)' }}>
            Validez vos compétences et boostez votre CV avec des attestations reconnues.
          </p>
        </div>
      </motion.div>

      {/* Bande pleine largeur — progression */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: .3, duration: .7 }}
        className="md:col-span-12 relative overflow-hidden rounded-3xl group cursor-default"
        style={{ height: 220, border: '1px solid rgba(255,255,255,.07)' }}
      >
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80"
          alt="progression analytics"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'saturate(1.4) brightness(.4) hue-rotate(-10deg)' }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, rgba(8,7,26,.92) 0%, rgba(99,102,241,.2) 50%, rgba(8,7,26,.92) 100%)',
        }} />
        {/* Mini barres de progression animées */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5" style={{ width: 180 }}>
          {[
            { label: 'Python', pct: 82, color: '#818cf8' },
            { label: 'Design', pct: 65, color: '#a78bfa' },
            { label: 'Cloud',  pct: 47, color: '#c084fc' },
          ].map((b, i) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'rgba(255,255,255,.45)' }}>{b.label}</span>
                <span style={{ color: b.color, fontWeight: 700 }}>{b.pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${b.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: .5 + i * .15, duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: b.color }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-center md:justify-start md:pl-16">
          <div>
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-2xl font-black text-white mb-1">Suivez chaque étape de votre progression</h3>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 15 }}>
              Tableaux de bord · Quiz interactifs · Historique complet
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  </div>
</section>
<div className="section-divider" />
      {/* ═══════════════════════════════════════
          ÉTAPES
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-5"
              style={{ background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.25)', color: '#c4b5fd' }}>
              Comment ça marche
            </span>
            <h2 className="font-black text-white" style={{ fontSize: 'clamp(36px,6vw,64px)' }}>
              4 étapes vers le <span className="shimmer-text">succès</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            {/* Ligne de connexion */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px z-0"
              style={{ background: 'linear-gradient(to right,transparent,rgba(139,92,246,.3) 20%,rgba(139,92,246,.3) 80%,transparent)' }} />

            {STEPS.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * .14, duration: .6, ease: [.16,1,.3,1] }}
                whileHover={{ y: -14 }}
                className="apple-glass apple-glass-hover p-7 text-center relative z-10"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 8 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
                  style={{
                    background: 'linear-gradient(135deg,rgba(139,92,246,.25),rgba(99,102,241,.12))',
                    border: '1px solid rgba(139,92,246,.28)',
                    boxShadow: '0 0 28px rgba(139,92,246,.12)',
                  }}
                >
                  {step.icon}
                </motion.div>
                <div className="text-xs font-black mb-2 tracking-widest" style={{ color: 'rgba(139,92,246,.5)', letterSpacing: '.2em' }}>
                  ÉTAPE {step.num}
                </div>
                <h3 className="font-black text-white text-xl mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.38)' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <div className="section-divider" />
      {/* ═══════════════════════════════════════
    FEATURES avec images
═══════════════════════════════════════ */}
<section className="relative z-10 py-24 px-4">
  <div className="max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(36px,6vw,64px)' }}>
        Pourquoi choisir <span className="shimmer-text">E-Learn</span> ?
      </h2>
      <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,.38)' }}>
        Tout ce dont vous avez besoin pour apprendre efficacement
      </p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {FEATURES.map((f, i) => (
        <motion.div key={f.title}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * .08, duration: .6 }}
          onHoverStart={() => setHoveredFeature(i)}
          onHoverEnd={() => setHoveredFeature(null)}
          whileHover={{ y: -10 }}
          className="apple-glass apple-glass-hover overflow-hidden cursor-default"
          style={{ borderRadius: 24 }}
        >
          {/* Image avec overlay gradient + icône */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={FEATURE_IMAGES[i]}
              alt={f.title}
              className="w-full h-full object-cover transition-transform duration-700"
              style={{
                filter: 'saturate(1.3) brightness(.5)',
                transform: hoveredFeature === i ? 'scale(1.08)' : 'scale(1)',
              }}
            />
            <div className="absolute inset-0" style={{ background: `${f.gradient.replace('135deg', 'to bottom').replace(')', '55)')}, rgba(8,7,26,.6) 100%)`.replace('linear-gradient(to bottom', 'linear-gradient(to bottom') }} />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to bottom, transparent 30%, rgba(8,7,26,.85) 100%)',
            }} />
            {/* Icône avec fond pill */}
            <motion.div
              animate={hoveredFeature === i ? { scale: 1.18, rotate: 8 } : { scale: 1, rotate: 0 }}
              transition={{ duration: .35 }}
              className="absolute bottom-3 left-5 w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: 'rgba(255,255,255,.1)',
                border: '1px solid rgba(255,255,255,.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {f.icon}
            </motion.div>
            {/* Numéro */}
            <div className="absolute top-3 right-4 text-xs font-black tracking-widest"
              style={{ color: 'rgba(255,255,255,.18)', letterSpacing: '.15em' }}>
              0{i + 1}
            </div>
          </div>

          {/* Texte */}
          <div className="p-6">
            <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.42)' }}>{f.desc}</p>
            <AnimatePresence>
              {hoveredFeature === i && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="mt-3 flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: '#a78bfa' }}
                >
                  <span>En savoir plus</span>
                  <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1 }}>→</motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>
<div className="section-divider" />   
{/* ═══════════════════════════════════════
    TÉMOIGNAGES
═══════════════════════════════════════ */}
<section className="relative z-10 py-20 px-4 overflow-hidden">
  <div className="max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      <h2 className="font-black text-white" style={{ fontSize: 'clamp(28px,5vw,52px)' }}>
        Ils ont transformé leur <span className="shimmer-text">carrière</span>
      </h2>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[
        {
          name: 'Sarah M.',
          role: 'Dev Front-end',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80',
          text: 'En 3 mois j\'ai décroché mon premier poste en développement. La formation React était incroyablement bien construite.',
          course: 'React & Next.js',
          stars: 5,
          color: '#818cf8',
        },
        {
          name: 'Karim B.',
          role: 'Data Analyst',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
          text: 'L\'assistant IA m\'a guidé vers les bonnes formations. J\'ai doublé mon salaire en 6 mois grâce à Python & SQL.',
          course: 'Data Science',
          stars: 5,
          color: '#a78bfa',
        },
        {
          name: 'Nadia L.',
          role: 'UX Designer',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
          text: 'Les vidéos HD et les quiz interactifs rendent l\'apprentissage vraiment engageant. J\'adore la progression visible.',
          course: 'UX/UI Design',
          stars: 5,
          color: '#c084fc',
        },
      ].map((t, i) => (
        <motion.div key={t.name}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * .12 }}
          whileHover={{ y: -8 }}
          className="apple-glass apple-glass-hover p-7 cursor-default"
        >
          {/* Étoiles */}
          <div className="flex gap-1 mb-5">
            {[...Array(t.stars)].map((_, j) => (
              <motion.span key={j}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: .4 + j * .07 }}
                style={{ color: '#fbbf24', fontSize: 14 }}>★</motion.span>
            ))}
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,.55)' }}>
            "{t.text}"
          </p>
          <div className="flex items-center gap-3">
            <img src={t.avatar} alt={t.name}
              className="w-10 h-10 rounded-full object-cover"
              style={{ border: `2px solid ${t.color}60` }} />
            <div>
              <div className="font-bold text-white text-sm">{t.name}</div>
              <div className="text-xs" style={{ color: t.color }}>{t.role} · {t.course}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>
<div className="section-divider" />
      {/* ═══════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: .92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: .8, ease: [.16,1,.3,1] }}
            className="relative rounded-3xl overflow-hidden p-16 text-center"
          >
            {/* Photo de fond CTA */}
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'saturate(1.2) brightness(.35) hue-rotate(-10deg)', zIndex: 0 }}
            />
            <div className="absolute inset-0 z-0" style={{
              background: 'linear-gradient(135deg,rgba(139,92,246,.55) 0%,rgba(99,102,241,.35) 50%,rgba(8,7,26,.85) 100%)',
            }} />
            <div className="absolute inset-0 z-0" style={{
              backdropFilter: 'blur(2px)',
              background: 'rgba(8,7,26,.3)',
            }} />

            {/* Anneaux rotatifs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {[
                { sz: 380, top: -180, right: -160, dur: 25 },
                { sz: 300, bottom: -150, left: -130, dur: 35, rev: true },
                { sz: 220, top: '50%', left: '50%', dur: 20, center: true },
              ].map((r, i) => (
                <motion.div key={i}
                  animate={{ rotate: r.rev ? -360 : 360 }}
                  transition={{ duration: r.dur, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute', width: r.sz, height: r.sz, borderRadius: '50%',
                    border: '1px solid rgba(139,92,246,.14)',
                    top: r.top, bottom: r.bottom, right: r.right, left: r.left,
                    transform: r.center ? 'translate(-50%,-50%)' : undefined,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <motion.div
                animate={{ y: [0,-18,0], rotate: [0,8,-8,0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-7xl mb-8"
              >🚀</motion.div>

              <h2 className="font-black text-white mb-5" style={{ fontSize: 'clamp(36px,6vw,64px)' }}>
                Prêt à vous lancer ?
              </h2>
              <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,.5)' }}>
                Rejoignez{' '}
                <span style={{ color: '#c4b5fd', fontWeight: 700 }}>+1000 apprenants</span>
                {' '}et développez les compétences qui feront la différence dans votre carrière.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {!user ? (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
                      <Link to="/register" className="cta-primary">Créer mon compte ✨</Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
                      <Link to="/become-instructor" className="cta-primary">👨‍🏫 Devenir instructeur</Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}>
                      <Link to="/chatbot" className="cta-secondary">🤖 Parler à l'assistant</Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }}
                    onClick={() => navigate(dashboardPath)} className="cta-primary">
                    Accéder à mon espace →
                  </motion.button>
                )}
              </div>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex -space-x-3">
                  {['👨‍💻','👩‍🎓','👨‍🏫','👩‍💼','🧑‍🔬','👨‍🎨'].map((emoji, i) => (
                    <motion.div key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * .08, type: 'spring', stiffness: 300 }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
                      style={{ background: 'rgba(139,92,246,.25)', borderColor: 'rgba(139,92,246,.5)' }}
                    >{emoji}</motion.div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>
                  <span className="text-white font-bold text-base">+1000</span> apprenants nous font confiance
                </p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <motion.span key={s}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: s * .1 }}
                      className="text-amber-400 text-xl">★</motion.span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="relative z-10 py-10 px-4"
        style={{ borderTop: '1px solid rgba(139,92,246,.1)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
              <span className="text-white font-bold text-xs">EL</span>
            </div>
            <span className="font-bold text-white text-sm">E-Learn</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,.2)' }}>
            © 2026 E-Learn — Tous droits réservés
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Connexion',  to: '/login' },
            ].map(link => (
              <Link key={link.label} to={link.to}
                className="text-xs transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,.28)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.28)'}>
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