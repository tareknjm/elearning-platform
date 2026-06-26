import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import Navbar from '../../components/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faXmark, faStar, faBolt, faSeedling,
  faInfinity, faVideo, faRobot, faCertificate,
  faChartLine, faHeadset, faDownload, faLock,
  faUnlock, faArrowRight, faShieldHalved, faCrown,
} from '@fortawesome/free-solid-svg-icons';

const PLANS = [
  {
    key: 'free',
    name: 'Gratuit',
    icon: faSeedling,
    iconColor: '#6ee7b7',
    price: { monthly: 0, yearly: 0 },
    gradient: 'linear-gradient(135deg,rgba(107,114,128,0.15),rgba(75,85,99,0.08))',
    border: 'rgba(107,114,128,0.25)',
    borderHover: 'rgba(107,114,128,0.5)',
    glow: 'rgba(107,114,128,0.1)',
    badge: null,
    accentColor: '#9ca3af',
    features: [
      { icon: faVideo,       text: '2 premières vidéos par cours',     included: true  },
      { icon: faRobot,       text: 'Chatbot IA basique',               included: true  },
      { icon: faStar,        text: '3 formations accessibles',         included: true  },
      { icon: faChartLine,   text: 'Tableau de bord basique',          included: true  },
      { icon: faInfinity,    text: 'Formations illimitées',            included: false },
      { icon: faCertificate, text: 'Certificats officiels',            included: false },
      { icon: faDownload,    text: 'Téléchargement des ressources',    included: false },
      { icon: faHeadset,     text: 'Support prioritaire',              included: false },
      { icon: faBolt,        text: 'Nouvelles formations en avant-première', included: false },
      { icon: faChartLine,   text: 'Analytics complet',                included: false },
    ],
    cta: 'Commencer gratuitement',
    ctaStyle: 'secondary',
  },
  {
    key: 'premium',
    name: 'Premium',
    icon: faCrown,
    iconColor: '#fbbf24',
    price: { monthly: 19, yearly: 15 },
    gradient: 'linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.12))',
    border: 'rgba(139,92,246,0.35)',
    borderHover: 'rgba(139,92,246,0.7)',
    glow: 'rgba(139,92,246,0.25)',
    badge: 'LE PLUS POPULAIRE',
    accentColor: '#a78bfa',
    features: [
      { icon: faInfinity,    text: 'Formations illimitées',            included: true },
      { icon: faVideo,       text: 'Toutes les vidéos HD',             included: true },
      { icon: faRobot,       text: 'Chatbot IA avancé',                included: true },
      { icon: faCertificate, text: 'Certificats officiels',            included: true },
      { icon: faDownload,    text: 'Téléchargement des ressources',    included: true },
      { icon: faHeadset,     text: 'Support prioritaire 24/7',         included: true },
      { icon: faBolt,        text: 'Nouvelles formations en avant-première', included: true },
      { icon: faChartLine,   text: 'Analytics complet',                included: true },
      { icon: faShieldHalved,text: 'Accès à vie aux cours achetés',    included: true },
      { icon: faStar,        text: 'Badge Premium visible',            included: true },
    ],
    cta: 'Passer Premium',
    ctaStyle: 'primary',
  },
];

const FAQ = [
  {
    q: 'Puis-je annuler à tout moment ?',
    a: 'Oui, sans engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Votre accès Premium reste actif jusqu\'à la fin de la période payée.',
  },
  {
    q: 'Que se passe-t-il après l\'expiration ?',
    a: 'Votre compte repasse automatiquement en version gratuite. Vous conservez l\'accès à vos certificats déjà obtenus et aux formations terminées.',
  },
  {
    q: 'Les certificats sont-ils reconnus ?',
    a: 'Nos certificats sont générés avec votre nom, la formation, la date et votre score. Ils sont téléchargeables en PDF et partageables sur LinkedIn.',
  },
  {
    q: 'Y a-t-il une période d\'essai ?',
    a: 'Le plan gratuit vous permet de tester la plateforme sans limite de temps. Passez Premium quand vous êtes convaincu.',
  },
];

const PricingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const savings = Math.round((1 - 15 / 19) * 100);
  const yearSaving = (19 - 15) * 12;

  const handleCta = (plan) => {
  if (!user) { navigate('/register'); return; }
  if (plan.key === 'premium') {
    navigate(`/learner/payment?billing=${billing}`);
  } else {
    navigate('/learner/dashboard');
  }
};

  return (
    <div style={{
      background: `linear-gradient(160deg,
        #08071a 0%, #0e0c2e 15%, #12103a 30%,
        #16123f 50%, #0f0a28 75%, #08071a 100%)`,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    }}>

      <style>{`
        .shimmer-text {
          background: linear-gradient(120deg,#c4b5fd 0%,#818cf8 40%,#a78bfa 70%,#e0d7ff 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        @keyframes shimmer {
          0%  { background-position: 0%   center; }
          100%{ background-position: 220% center; }
        }
        .gold-shimmer {
          background: linear-gradient(120deg,#fbbf24 0%,#f59e0b 40%,#fcd34d 70%,#fbbf24 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      {/* Orbes fond */}
      {[
        { s: 700, top: '-5%',  left: '-10%', c: '139,92,246', o: 0.08 },
        { s: 600, top: '45%',  right: '-8%', c: '99,102,241', o: 0.07 },
        { s: 450, top: '75%',  left: '15%',  c: '167,139,250', o: 0.05 },
      ].map((orb, i) => (
        <div key={i} className="fixed pointer-events-none z-0" style={{
          width: orb.s, height: orb.s, borderRadius: '50%',
          background: `radial-gradient(circle,rgba(${orb.c},${orb.o}) 0%,transparent 70%)`,
          top: orb.top, left: orb.left, right: orb.right,
        }} />
      ))}

      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-32">

        {/* ── HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8 text-sm font-semibold"
            style={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.3)',
              color: '#c4b5fd',
            }}>
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full"
              style={{ background: '#a78bfa', boxShadow: '0 0 8px #8b5cf6' }}
            />
            <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24' }} />
            Choisissez votre plan
          </motion.div>

          <h1 className="font-black text-white mb-6"
            style={{ fontSize: 'clamp(40px,7vw,80px)', lineHeight: 1.05 }}>
            Investissez dans<br />
            <span className="shimmer-text">votre avenir</span>
          </h1>

          <p className="text-xl max-w-xl mx-auto mb-12"
            style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Commencez gratuitement, passez Premium quand vous êtes prêt.
            Sans engagement, annulable à tout moment.
          </p>

          {/* Toggle mensuel / annuel */}
          <div className="inline-flex items-center p-1.5 rounded-2xl mb-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
            {[
              { key: 'monthly', label: 'Mensuel' },
              { key: 'yearly',  label: 'Annuel'  },
            ].map(b => (
              <button key={b.key} onClick={() => setBilling(b.key)}
                className="relative px-7 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2"
                style={billing === b.key ? {
                  background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(139,92,246,0.4)',
                } : { color: 'rgba(255,255,255,0.45)' }}>
                {b.label}
                {b.key === 'yearly' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black"
                    style={{
                      background: billing === 'yearly'
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(139,92,246,0.3)',
                      color: billing === 'yearly' ? 'white' : '#c4b5fd',
                    }}>
                    -{savings}%
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {billing === 'yearly' && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-sm font-semibold"
                style={{ color: '#6ee7b7' }}>
                <FontAwesomeIcon icon={faStar} className="mr-1" />
                Vous économisez {yearSaving}€ par an avec le plan annuel
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── PLANS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-24">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onHoverStart={() => setHoveredPlan(plan.key)}
              onHoverEnd={() => setHoveredPlan(null)}
              whileHover={{ y: -10, scale: 1.01 }}
              className="relative rounded-3xl p-8 flex flex-col"
              style={{
                background: plan.gradient,
                border: `1px solid ${hoveredPlan === plan.key ? plan.borderHover : plan.border}`,
                boxShadow: hoveredPlan === plan.key
                  ? `0 32px 64px ${plan.glow}, 0 0 0 1px ${plan.border}`
                  : 'none',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                backdropFilter: 'blur(20px)',
              }}>

              {/* Badge populaire */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="px-5 py-1.5 rounded-full text-xs font-black tracking-widest flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(139,92,246,0.55)',
                    }}>
                    <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24' }} />
                    {plan.badge}
                  </motion.div>
                </div>
              )}

              {/* Icône + nom */}
              <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl"
                  style={{
                    background: plan.key === 'premium'
                      ? 'rgba(139,92,246,0.2)'
                      : 'rgba(107,114,128,0.15)',
                    border: `1px solid ${plan.border}`,
                  }}>
                  <FontAwesomeIcon icon={plan.icon} style={{ color: plan.iconColor, fontSize: 22 }} />
                </div>
                <div>
                  <h2 className="font-black text-white text-xl">{plan.name}</h2>
                  {plan.key === 'premium' && (
                    <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>
                      Accès complet à tout
                    </span>
                  )}
                </div>
              </div>

              {/* Prix */}
              <div className="mb-8 pb-8"
                style={{ borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
                <AnimatePresence mode="wait">
                  <motion.div key={billing}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-end gap-2">
                    <span className="font-black text-white"
                      style={{ fontSize: 56, lineHeight: 1 }}>
                      {plan.price[billing] === 0 ? '0' : plan.price[billing]}
                    </span>
                    <div className="mb-2">
                      <span className="text-lg font-bold"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                        €
                      </span>
                      <span className="block text-xs"
                        style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {plan.price[billing] === 0 ? 'pour toujours' : `/ mois`}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {billing === 'yearly' && plan.key === 'premium' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs mt-2 font-medium"
                    style={{ color: '#6ee7b7' }}>
                    <FontAwesomeIcon icon={faCheck} className="mr-1" />
                    Facturé {plan.price.yearly * 12}€/an · Économisez {yearSaving}€
                  </motion.p>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 space-y-1 mb-8">
                {plan.features.map((f, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + j * 0.04 }}
                    className="flex items-center gap-3 py-2.5 px-1"
                    style={{
                      borderBottom: j < plan.features.length - 1
                        ? '1px solid rgba(255,255,255,0.04)'
                        : 'none',
                      opacity: f.included ? 1 : 0.4,
                    }}>

                    {/* Icône feature */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: f.included
                          ? plan.key === 'premium'
                            ? 'rgba(139,92,246,0.2)'
                            : 'rgba(107,114,128,0.15)'
                          : 'rgba(255,255,255,0.04)',
                      }}>
                      <FontAwesomeIcon
                        icon={f.icon}
                        style={{
                          fontSize: 11,
                          color: f.included ? plan.accentColor : 'rgba(255,255,255,0.2)',
                        }}
                      />
                    </div>

                    {/* Texte */}
                    <span className="text-sm flex-1"
                      style={{ color: f.included ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>
                      {f.text}
                    </span>

                    {/* Check / X */}
                    <FontAwesomeIcon
                      icon={f.included ? faCheck : faXmark}
                      style={{
                        fontSize: 12,
                        color: f.included
                          ? plan.key === 'premium' ? '#a78bfa' : '#6ee7b7'
                          : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCta(plan)}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all"
                style={plan.ctaStyle === 'primary' ? {
                  background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                } : {
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                }}>
                <FontAwesomeIcon icon={plan.key === 'premium' ? faBolt : faUnlock} />
                {plan.cta}
                <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* ── GARANTIES ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-24"
        >
          {[
            { icon: faShieldHalved, color: '#6ee7b7', title: 'Sans engagement',     desc: 'Annulez à tout moment, aucune pénalité' },
            { icon: faLock,         color: '#a78bfa', title: 'Paiement sécurisé',   desc: 'Vos données bancaires sont protégées' },
            { icon: faHeadset,      color: '#fbbf24', title: 'Support 24/7',        desc: 'Une équipe disponible à tout moment' },
          ].map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `rgba(${g.color === '#6ee7b7' ? '110,231,183' : g.color === '#a78bfa' ? '167,139,250' : '251,191,36'},0.15)` }}>
                <FontAwesomeIcon icon={g.icon} style={{ color: g.color, fontSize: 18 }} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">{g.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{g.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-24"
        >
          <h2 className="font-black text-white text-center mb-10"
            style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
            Questions <span className="shimmer-text">fréquentes</span>
          </h2>

          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-sm text-white">{item.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-4"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                    <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10, transform: 'rotate(-45deg)' }} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}>
                      <p className="px-5 pb-5 text-sm leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA FINAL ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden p-16 text-center max-w-4xl mx-auto"
          style={{
            background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15))',
            border: '1px solid rgba(139,92,246,0.3)',
          }}>

          {/* Anneaux décoratifs */}
          {[300, 220, 150].map((sz, i) => (
            <motion.div key={i}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 20 + i * 8, repeat: Infinity, ease: 'linear' }}
              className="absolute pointer-events-none"
              style={{
                width: sz, height: sz, borderRadius: '50%',
                border: '1px solid rgba(139,92,246,0.12)',
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}

          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-5xl mb-6">
              ⚡
            </motion.div>
            <h2 className="font-black text-white mb-4"
              style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
              Prêt à débloquer tout le potentiel ?
            </h2>
            <p className="text-lg mb-8 max-w-lg mx-auto"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              Rejoignez des centaines d'apprenants qui ont boosté leur carrière avec E-Learn Premium.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(user ? '/learner/dashboard' : '/register')}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg"
              style={{
                background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                boxShadow: '0 8px 32px rgba(139,92,246,0.5)',
              }}>
              <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24' }} />
              {user ? 'Passer Premium maintenant' : 'Commencer gratuitement'}
              <FontAwesomeIcon icon={faArrowRight} />
            </motion.button>
          </div>
        </motion.div>

      </div>

      {/* Footer minimal */}
      <footer className="relative z-10 py-8 px-4 text-center"
        style={{ borderTop: '1px solid rgba(139,92,246,0.1)' }}>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 E-Learn — Tous droits réservés ·{' '}
          <Link to="/" style={{ color: 'rgba(139,92,246,0.6)' }}>Accueil</Link>
          {' '}·{' '}
          <Link to="/courses" style={{ color: 'rgba(139,92,246,0.6)' }}>Formations</Link>
        </p>
      </footer>
    </div>
  );
};

export default PricingPage;