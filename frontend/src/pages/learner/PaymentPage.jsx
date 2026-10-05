import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { activateSubscription } from '../../services/subscriptionService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard, faLock, faCheck, faCrown,
  faCircleNotch, faShieldHalved, faBolt,
  faCalendarCheck, faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import {
  faCheckCircle,
} from '@fortawesome/free-regular-svg-icons';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const billing = searchParams.get('billing') || 'monthly';
  const { user, updateUser } = useAuth();

  const price = billing === 'yearly' ? 15 : 19;
  const total = billing === 'yearly' ? 15 * 12 : 19;

  const [step, setStep] = useState('form'); // 'form' | 'processing' | 'success'
  const [form, setForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // Format numéro carte
  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0, 16)
      .replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
  };

  const validate = () => {
    const e = {};
    if (form.cardNumber.replace(/\s/g, '').length < 16)
      e.cardNumber = 'Numéro de carte invalide';
    if (!form.cardName.trim())
      e.cardName = 'Nom requis';
    if (form.expiry.length < 5)
      e.expiry = 'Date invalide';
    if (form.cvv.length < 3)
      e.cvv = 'CVV invalide';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep('processing');

    // Simulation délai paiement
    await new Promise(r => setTimeout(r, 3000));

    try {
      const updated = await activateSubscription(billing);
      updateUser({ plan: updated.plan, planExpiresAt: updated.planExpiresAt });
      localStorage.setItem('plan', updated.plan); 
      const key = `premium_popup_${user?.userId}`;
localStorage.setItem(key, 'true'); 
      setStep('success');
    } catch {
      setStep('form');
      setErrors({ global: 'Erreur lors de l\'activation. Réessayez.' });
    }
  };

  // Detect card type
  const getCardType = () => {
    const n = form.cardNumber.replace(/\s/g, '');
    if (n.startsWith('4')) return 'VISA';
    if (n.startsWith('5')) return 'MC';
    if (n.startsWith('3')) return 'AMEX';
    return null;
  };

  const cardType = getCardType();

  const inputStyle = (field) => ({
    background: focusedField === field
      ? 'rgba(139,92,246,0.08)'
      : 'rgba(255,255,255,0.04)',
    border: `1px solid ${errors[field]
      ? 'rgba(239,68,68,0.5)'
      : focusedField === field
        ? 'rgba(139,92,246,0.5)'
        : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 14,
    color: 'white',
    padding: '14px 16px',
    width: '100%',
    fontSize: 15,
    outline: 'none',
    transition: 'all 0.2s',
  });

  return (
    <div style={{
      background: `linear-gradient(160deg,
        #08071a 0%, #0e0c2e 15%, #12103a 30%,
        #16123f 50%, #0f0a28 75%, #08071a 100%)`,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>

      <style>{`
        .shimmer-text {
          background: linear-gradient(120deg,#c4b5fd 0%,#818cf8 40%,#a78bfa 70%,#e0d7ff 100%);
          background-size: 220% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer {
          0%  { background-position: 0%   center; }
          100%{ background-position: 220% center; }
        }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      {/* Orbes */}
      {[
        { s: 600, top: '-10%', left: '-10%', c: '139,92,246', o: 0.08 },
        { s: 500, bottom: '-10%', right: '-8%', c: '99,102,241', o: 0.07 },
      ].map((orb, i) => (
        <div key={i} className="fixed pointer-events-none z-0" style={{
          width: orb.s, height: orb.s, borderRadius: '50%',
          background: `radial-gradient(circle,rgba(${orb.c},${orb.o}) 0%,transparent 70%)`,
          top: orb.top, bottom: orb.bottom, left: orb.left, right: orb.right,
        }} />
      ))}

      <div className="relative z-10 w-full max-w-5xl">
        <AnimatePresence mode="wait">

          {/* ── ÉTAPE 1 : FORMULAIRE ── */}
          {step === 'form' && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Colonne gauche — formulaire */}
              <div className="rounded-3xl p-8"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                }}>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <button onClick={() => navigate('/pricing')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                    <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 13 }} />
                  </button>
                  <div>
                    <h1 className="font-black text-white text-xl">Paiement sécurisé</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <FontAwesomeIcon icon={faLock} className="mr-1" style={{ color: '#6ee7b7' }} />
                      Connexion chiffrée SSL 256-bit
                    </p>
                  </div>
                </div>

                {/* Carte visuelle */}
                <div className="relative rounded-2xl p-6 mb-8 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg,#8b5cf6,#6366f1,#4f46e5)',
                    minHeight: 160,
                  }}>
                  {/* Cercles déco */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)' }} />

                  <div className="relative z-10">
                    {/* Puce + type */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-7 rounded-md"
                        style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }} />
                      {cardType && (
                        <span className="font-black text-white text-sm tracking-widest">
                          {cardType}
                        </span>
                      )}
                    </div>

                    {/* Numéro */}
                    <p className="font-mono text-white text-lg tracking-widest mb-4"
                      style={{ letterSpacing: '0.15em', minHeight: 28 }}>
                      {form.cardNumber || '•••• •••• •••• ••••'}
                    </p>

                    {/* Nom + expiry */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          TITULAIRE
                        </p>
                        <p className="font-bold text-white text-sm uppercase tracking-wider">
                          {form.cardName || 'VOTRE NOM'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          EXPIRATION
                        </p>
                        <p className="font-bold text-white text-sm">
                          {form.expiry || 'MM/YY'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Champs */}
                <div className="space-y-4">
                  {errors.global && (
                    <div className="p-3 rounded-xl text-sm text-center"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                      {errors.global}
                    </div>
                  )}

                  {/* Numéro carte */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={form.cardNumber}
                      onChange={e => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                      onFocus={() => setFocusedField('cardNumber')}
                      onBlur={() => setFocusedField(null)}
                      style={inputStyle('cardNumber')}
                    />
                    {errors.cardNumber && (
                      <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{errors.cardNumber}</p>
                    )}
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                      style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Nom sur la carte
                    </label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={form.cardName}
                      onChange={e => setForm({ ...form, cardName: e.target.value.toUpperCase() })}
                      onFocus={() => setFocusedField('cardName')}
                      onBlur={() => setFocusedField(null)}
                      style={inputStyle('cardName')}
                    />
                    {errors.cardName && (
                      <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{errors.cardName}</p>
                    )}
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                        style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Date d'expiration
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={form.expiry}
                        onChange={e => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                        onFocus={() => setFocusedField('expiry')}
                        onBlur={() => setFocusedField(null)}
                        style={inputStyle('expiry')}
                      />
                      {errors.expiry && (
                        <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{errors.expiry}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                        style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <FontAwesomeIcon icon={faLock} className="mr-1" />
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={form.cvv}
                        onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        onFocus={() => setFocusedField('cvv')}
                        onBlur={() => setFocusedField(null)}
                        style={inputStyle('cvv')}
                      />
                      {errors.cvv && (
                        <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{errors.cvv}</p>
                      )}
                    </div>
                  </div>

                  {/* Bouton payer */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="w-full py-4 rounded-2xl font-black text-white text-base flex items-center justify-center gap-3 mt-2"
                    style={{
                      background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                      boxShadow: '0 8px 32px rgba(139,92,246,0.45)',
                    }}>
                    <FontAwesomeIcon icon={faLock} />
                    Payer {billing === 'yearly' ? `${total}€` : `${price}€/mois`}
                    <FontAwesomeIcon icon={faBolt} style={{ color: '#fbbf24' }} />
                  </motion.button>

                  {/* Sécurité */}
                  <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <FontAwesomeIcon icon={faShieldHalved} className="mr-1" />
                    Paiement 100% simulé — aucune donnée réelle collectée
                  </p>
                </div>
              </div>

              {/* Colonne droite — résumé commande */}
              <div className="flex flex-col gap-4">

                {/* Récap plan */}
                <div className="rounded-3xl p-7"
                  style={{
                    background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.08))',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24', fontSize: 20 }} />
                    </div>
                    <div>
                      <p className="font-black text-white text-lg">Plan Premium</p>
                      <p className="text-xs" style={{ color: '#a78bfa' }}>
                        {billing === 'yearly' ? 'Abonnement annuel' : 'Abonnement mensuel'}
                      </p>
                    </div>
                  </div>

                  {/* Ligne de prix */}
                  <div className="space-y-3 mb-6 pb-6"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {billing === 'yearly' ? `15€ × 12 mois` : 'Mensuel'}
                      </span>
                      <span className="text-white font-semibold">{total}€</span>
                    </div>
                    {billing === 'yearly' && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: '#6ee7b7' }}>
                          <FontAwesomeIcon icon={faCheck} className="mr-1" />
                          Économie annuelle
                        </span>
                        <span style={{ color: '#6ee7b7' }} className="font-semibold">-48€</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black">
                      <span className="text-white">Total</span>
                      <span className="shimmer-text">{total}€</span>
                    </div>
                  </div>

                  {/* Durée */}
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(139,92,246,0.1)' }}>
                    <FontAwesomeIcon icon={faCalendarCheck} style={{ color: '#a78bfa' }} />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Accès Premium pendant{' '}
                      <strong className="text-white">
                        {billing === 'yearly' ? '12 mois' : '1 mois'}
                      </strong>
                      {' '}à partir d'aujourd'hui
                    </p>
                  </div>
                </div>

                {/* Ce qui est inclus */}
                <div className="rounded-3xl p-7 flex-1"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                  <p className="font-bold text-white mb-5 text-sm">
                    <FontAwesomeIcon icon={faBolt} style={{ color: '#fbbf24' }} className="mr-2" />
                    Inclus dans votre plan
                  </p>
                  {[
                    'Formations illimitées',
                    'Toutes les vidéos HD',
                    'Certificats officiels PDF',
                    'Quiz interactifs',
                    'Support prioritaire 24/7',
                    'Analytics complet',
                  ].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 py-2.5"
                      style={{
                        borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(139,92,246,0.2)' }}>
                        <FontAwesomeIcon icon={faCheck} style={{ color: '#a78bfa', fontSize: 9 }} />
                      </div>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : TRAITEMENT ── */}
          {step === 'processing' && (
            <motion.div key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-20">

              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6' }}>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLock} style={{ color: '#a78bfa', fontSize: 28 }} />
                </div>
              </div>

              <h2 className="font-black text-white text-2xl mb-3">Traitement en cours...</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>
                Vérification et activation de votre abonnement
              </p>

              <div className="mt-10 space-y-3 w-full max-w-xs">
                {[
                  'Vérification des informations',
                  'Validation du paiement',
                  'Activation du compte Premium',
                ].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.8 }}
                    className="flex items-center gap-3 p-3 rounded-xl text-left"
                    style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.8 + 0.3 }}>
                      <FontAwesomeIcon icon={faCheck} style={{ color: '#6ee7b7', fontSize: 12 }} />
                    </motion.div>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : SUCCÈS ── */}
          {step === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col items-center justify-center text-center py-16 max-w-lg mx-auto">

              {/* Icône succès */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="relative mb-8">
                <div className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 0 60px rgba(139,92,246,0.5)' }}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'white', fontSize: 48 }} />
                </div>
                {/* Particules */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: Math.cos(i * 45 * Math.PI / 180) * 70,
                      y: Math.sin(i * 45 * Math.PI / 180) * 70,
                      opacity: [1, 1, 0],
                    }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                    style={{
                      background: ['#a78bfa', '#fbbf24', '#6ee7b7', '#818cf8'][i % 4],
                      marginLeft: -6, marginTop: -6,
                    }}
                  />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-bold"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd' }}>
                  <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24' }} />
                  Bienvenue dans Premium !
                </div>

                <h2 className="font-black text-white mb-4" style={{ fontSize: 36 }}>
                  Paiement confirmé ! 🎉
                </h2>
                <p className="mb-2" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  Votre compte <strong className="text-white">{user?.name}</strong> est maintenant
                  Premium pour{' '}
                  <strong className="text-white">
                    {billing === 'yearly' ? '12 mois' : '1 mois'}
                  </strong>.
                </p>
                <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Toutes vos fonctionnalités Premium sont immédiatement disponibles.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/learner/dashboard')}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-white text-base"
                  style={{
                    background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.45)',
                  }}>
                  <FontAwesomeIcon icon={faBolt} style={{ color: '#fbbf24' }} />
                  Accéder à mon espace Premium
                </motion.button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentPage;