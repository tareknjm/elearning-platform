import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { submitApplication } from '../../services/applicationService';

const BecomeInstructorPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    educationLevel: '',
    speciality: '',
    experience: '',
    motivation: '',
    linkedinUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.fullName || !form.email || !form.phone || !form.educationLevel) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }
    if (step === 2) {
      if (!form.speciality || !form.experience) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.motivation) {
      setError('Veuillez rédiger votre lettre de motivation');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitApplication(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '12px',
    color: 'white',
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    color: '#c4b5fd',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
    display: 'block',
  };

  const steps = [
    { num: 1, label: 'Informations personnelles', icon: '👤' },
    { num: 2, label: 'Expertise', icon: '🎯' },
    { num: 3, label: 'Motivation', icon: '✍️' },
  ];

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center max-w-lg">
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-8xl mb-6">
          🎉
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-4">
          Candidature envoyée !
        </h2>
        <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Votre candidature a bien été reçue. L'équipe d'administration
          l'examinera dans les plus brefs délais et vous contactera
          par email à <span style={{ color: '#c4b5fd' }}>{form.email}</span>.
        </p>
        <div className="flex gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/"
              className="px-8 py-3.5 rounded-2xl font-bold text-white inline-block"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 0 30px rgba(139,92,246,0.4)',
              }}>
              Retour à l'accueil
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/login"
              className="px-8 py-3.5 rounded-2xl font-bold text-white inline-block"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
              }}>
              Se connecter
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      <style>{`
        .app-input:focus {
          border-color: rgba(139,92,246,0.6) !important;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .app-input::placeholder { color: rgba(255,255,255,0.25); }
        .app-input option { background: #1a1040; color: white; }
      `}</style>

      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              <span className="text-white font-bold">EL</span>
            </div>
            <span className="text-white font-bold text-lg">E-Learn</span>
          </Link>
          <h1 className="text-4xl font-black text-white mb-3">
            Devenez{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Instructeur
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Partagez votre expertise avec des milliers d'apprenants
          </p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-1 font-bold transition-all duration-300"
                  style={step >= s.num ? {
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    boxShadow: '0 0 20px rgba(139,92,246,0.4)',
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {step > s.num ? '✓' : s.icon}
                </div>
                <span className="text-xs font-medium hidden md:block"
                  style={{ color: step >= s.num ? '#c4b5fd' : 'rgba(255,255,255,0.3)' }}>
                  {s.label}
                </span>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="w-16 md:w-24 h-0.5 mx-2 mb-5 transition-all duration-500"
                  style={{
                    background: step > s.num
                      ? 'linear-gradient(to right, #8b5cf6, #6366f1)'
                      : 'rgba(255,255,255,0.1)',
                  }} />
              )}
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(139,92,246,0.2)',
            backdropFilter: 'blur(20px)',
          }}>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl mb-6 text-sm flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#fca5a5',
              }}>
              ⚠️ {error}
            </motion.div>
          )}

          {/* ÉTAPE 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-black text-white mb-1">
                👤 Informations personnelles
              </h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Renseignez vos coordonnées
              </p>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Nom complet *</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="app-input"
                    style={inputStyle}
                    placeholder="Ahmed Benali" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="app-input"
                      style={inputStyle}
                      placeholder="ahmed@exemple.com" />
                  </div>
                  <div>
                    <label style={labelStyle}>Téléphone *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="app-input"
                      style={inputStyle}
                      placeholder="+212 6XX XXX XXX" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Niveau d'études *</label>
                  <select
                    name="educationLevel"
                    value={form.educationLevel}
                    onChange={handleChange}
                    className="app-input"
                    style={inputStyle}>
                    <option value="">-- Sélectionner --</option>
                    <option value="Bac+2">Bac+2 (BTS, DUT)</option>
                    <option value="Bac+3">Bac+3 (Licence)</option>
                    <option value="Bac+4">Bac+4 (Master 1)</option>
                    <option value="Bac+5">Bac+5 (Master, Ingénieur)</option>
                    <option value="Doctorat">Doctorat (PhD)</option>
                    <option value="Autodidacte">Autodidacte / Certifications</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Profil LinkedIn</label>
                  <input
                    name="linkedinUrl"
                    value={form.linkedinUrl}
                    onChange={handleChange}
                    className="app-input"
                    style={inputStyle}
                    placeholder="https://linkedin.com/in/ahmed-benali" />
                </div>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-black text-white mb-1">
                🎯 Expertise & Expérience
              </h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Décrivez votre domaine d'expertise
              </p>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Domaine de spécialité *</label>
                  <select
                    name="speciality"
                    value={form.speciality}
                    onChange={handleChange}
                    className="app-input"
                    style={inputStyle}>
                    <option value="">-- Choisir votre spécialité --</option>
                    <option value="Développement Web">Développement Web</option>
                    <option value="Développement Mobile">Développement Mobile</option>
                    <option value="Java & Spring Boot">Java & Spring Boot</option>
                    <option value="Python">Python</option>
                    <option value="JavaScript & React">JavaScript & React</option>
                    <option value="Base de données & SQL">Base de données & SQL</option>
                    <option value="DevOps & Cloud">DevOps & Cloud</option>
                    <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Cybersécurité">Cybersécurité</option>
                    <option value="Design UI/UX">Design UI/UX</option>
                    <option value="Flutter & Dart">Flutter & Dart</option>
                    <option value="Docker & Kubernetes">Docker & Kubernetes</option>
                    <option value="Algorithmique">Algorithmique</option>
                    <option value="Gestion de projet">Gestion de projet</option>
                    <option value="Marketing Digital">Marketing Digital</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Années d'expérience *</label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="app-input"
                    style={inputStyle}>
                    <option value="">-- Sélectionner --</option>
                    <option value="Moins d'1 an">Moins d'1 an</option>
                    <option value="1-2 ans">1 à 2 ans</option>
                    <option value="3-5 ans">3 à 5 ans</option>
                    <option value="5-10 ans">5 à 10 ans</option>
                    <option value="Plus de 10 ans">Plus de 10 ans</option>
                  </select>
                </div>

                {/* Aperçu profil */}
                {form.speciality && form.experience && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl flex items-center gap-3 mt-2"
                    style={{
                      background: 'rgba(139,92,246,0.1)',
                      border: '1px solid rgba(139,92,246,0.2)',
                    }}>
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-white text-sm font-semibold">
                        Profil : {form.speciality}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#c4b5fd' }}>
                        {form.experience} d'expérience • {form.educationLevel}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* ÉTAPE 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-black text-white mb-1">
                ✍️ Lettre de motivation
              </h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Expliquez pourquoi vous souhaitez enseigner sur notre plateforme
              </p>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>
                    Lettre de motivation *
                    <span className="font-normal ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      (minimum 100 caractères)
                    </span>
                  </label>
                  <textarea
                    name="motivation"
                    value={form.motivation}
                    onChange={handleChange}
                    rows={6}
                    className="app-input resize-none"
                    style={inputStyle}
                    placeholder="Décrivez votre passion pour l'enseignement, vos réalisations, vos projets pédagogiques..." />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs" style={{
                      color: form.motivation.length >= 100
                        ? '#6ee7b7'
                        : 'rgba(255,255,255,0.3)',
                    }}>
                      {form.motivation.length} / 100 min
                    </span>
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="rounded-2xl p-5"
                  style={{
                    background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: '#a78bfa' }}>
                    📋 Récapitulatif de votre candidature
                  </p>
                  <div className="space-y-1.5 text-sm">
                    {[
                      { label: 'Nom', value: form.fullName },
                      { label: 'Email', value: form.email },
                      { label: 'Spécialité', value: form.speciality },
                      { label: 'Expérience', value: form.experience },
                      { label: 'Niveau', value: form.educationLevel },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between">
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {item.label}
                        </span>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || form.motivation.length < 100}
                className="w-full py-4 rounded-2xl font-black text-white text-lg mt-6 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  boxShadow: '0 0 30px rgba(139,92,246,0.4)',
                }}>
                {loading ? '⏳ Envoi en cours...' : '🚀 Soumettre ma candidature'}
              </motion.button>
            </form>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                  ← Précédent
                </motion.button>
              ) : (
                <Link to="/"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                  ← Retour
                </Link>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="px-8 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
                }}>
                Suivant →
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Lien connexion */}
        <p className="text-center mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Déjà instructeur ?{' '}
          <Link to="/login"
            className="font-semibold transition"
            style={{ color: '#a78bfa' }}
            onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
            onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default BecomeInstructorPage;