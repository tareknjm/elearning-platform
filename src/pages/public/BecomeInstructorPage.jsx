import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { submitApplication } from '../../services/applicationService';
import { getCategories } from '../../services/categoryService';

const BecomeInstructorPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    educationLevel: '', speciality: '',
    experience: '', motivation: '', linkedinUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [specialityMode, setSpecialityMode] = useState('select');
  const [otherSpeciality, setOtherSpeciality] = useState('');
  const [specialityOpen, setSpecialityOpen] = useState(false);
const specialityDropdownRef = useRef(null);
  const [motivationFile, setMotivationFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  useEffect(() => {
  const handler = (e) => {
    if (specialityDropdownRef.current && !specialityDropdownRef.current.contains(e.target)) {
      setSpecialityOpen(false);
    }
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);

  const handleSpecialityChange = e => {
    const val = e.target.value;
    if (val === '__other__') {
      setSpecialityMode('other');
      setForm({ ...form, speciality: '' });
    } else {
      setSpecialityMode('select');
      setForm({ ...form, speciality: val });
    }
  };

  const handleFile = file => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setError('Format accepté : PDF, DOC, DOCX');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Taille maximum : 5 Mo');
      return;
    }
    setError('');
    setMotivationFile(file);
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!form.fullName || !form.email || !form.phone || !form.educationLevel) {
        setError('Tous les champs marqués * sont requis');
        return;
      }
    }
    if (step === 2) {
      const finalSpec = specialityMode === 'other' ? otherSpeciality : form.speciality;
      if (!finalSpec || !form.experience) {
        setError('Tous les champs marqués * sont requis');
        return;
      }
      setForm(prev => ({ ...prev, speciality: finalSpec }));
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!motivationFile) { setError('Veuillez joindre votre lettre de motivation'); return; }
    setLoading(true); setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('motivationFile', motivationFile);
      await submitApplication(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const displaySpeciality = specialityMode === 'other' ? otherSpeciality : form.speciality;

  const steps = [
    { num: 1, label: 'Identité', icon: '01' },
    { num: 2, label: 'Expertise', icon: '02' },
    { num: 3, label: 'Dossier', icon: '03' },
  ];

  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#080612' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.08, 0.03] }}
            transition={{ duration: 4 + i * 2, repeat: Infinity, delay: i }}
            className="absolute rounded-full"
            style={{
              width: `${300 + i * 200}px`, height: `${300 + i * 200}px`,
              background: 'radial-gradient(circle, #8b5cf6, transparent)',
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
            }} />
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 0 80px rgba(139,92,246,0.4)' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-4" style={{ letterSpacing: '-0.03em' }}>
          Dossier reçu.
        </h2>
        <p className="text-lg mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Notre équipe examinera votre candidature sous 48h.
        </p>
        <p className="text-sm mb-10" style={{ color: '#8b5cf6' }}>{form.email}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Accueil
          </Link>
          <Link to="/login"
            className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 8px 24px rgba(139,92,246,0.35)' }}>
            Se connecter
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#080612' }}>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute" style={{
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          top: '-100px', right: '-100px',
        }} />
        <div className="absolute" style={{
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
          bottom: '0', left: '-50px',
        }} />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <style>{`
        .bi-input {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 14px;
          color: white;
          width: 100%;
          padding: 13px 16px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }
        .bi-input:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
        }
        .bi-input::placeholder { color: rgba(255,255,255,0.2); }
        .bi-input option { background: #13102a; color: white; }
        .bi-select { appearance: none; cursor: pointer; }
      `}</style>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12">

        {/* Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
              <span className="text-white font-black text-sm">EL</span>
            </div>
            <span className="text-white font-bold">E-Learn</span>
          </Link>
          <Link to="/login" className="text-xs font-medium px-4 py-2 rounded-xl"
            style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Déjà instructeur ? Connexion →
          </Link>
        </motion.div>

        {/* Hero text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: '#8b5cf6' }}>
            Programme instructeur
          </p>
          <h1 className="font-black text-white mb-3"
            style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Partagez ce que<br />
            <span style={{
              background: 'linear-gradient(135deg,#a78bfa,#818cf8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              vous savez faire.
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>
            Votre expertise mérite d'être transmise. Rejoignez notre réseau d'instructeurs.
          </p>
        </motion.div>

        {/* Stepper */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300"
                  style={step >= s.num ? {
                    background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.2)',
                  }}>
                  {step > s.num ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : s.icon}
                </div>
                <span className="text-xs font-semibold hidden sm:block"
                  style={{ color: step >= s.num ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 mx-3 h-px transition-all duration-500"
                  style={{
                    background: step > s.num
                      ? 'linear-gradient(to right,#8b5cf6,#6366f1)'
                      : 'rgba(255,255,255,0.06)',
                  }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl p-8"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(139,92,246,0.12)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            }}>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-xl mb-6 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── ÉTAPE 1 : Identité ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="mb-6">
                  <h2 className="text-lg font-black text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                    Informations personnelles
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Ces informations seront utilisées pour votre profil instructeur
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    Nom complet *
                  </label>
                  <input name="fullName" value={form.fullName} onChange={handleChange}
                    className="bi-input" placeholder="Ahmed Benali" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                      style={{ color: 'rgba(167,139,250,0.7)' }}>
                      Email *
                    </label>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      className="bi-input" placeholder="ahmed@exemple.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                      style={{ color: 'rgba(167,139,250,0.7)' }}>
                      Téléphone *
                    </label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      className="bi-input" placeholder="+212 6XX XXX XXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    Niveau d'études *
                  </label>
                  <div className="relative">
                    <select name="educationLevel" value={form.educationLevel} onChange={handleChange}
                      className="bi-input bi-select pr-10">
                      <option value="">-- Sélectionner --</option>
                      <option value="Bac+2">Bac+2 (BTS, DUT)</option>
                      <option value="Bac+3">Bac+3 (Licence)</option>
                      <option value="Bac+4">Bac+4 (Master 1)</option>
                      <option value="Bac+5">Bac+5 (Master, Ingénieur)</option>
                      <option value="Doctorat">Doctorat (PhD)</option>
                      <option value="Autodidacte">Autodidacte / Certifications</option>
                    </select>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      stroke="rgba(139,92,246,0.5)" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    LinkedIn <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>(optionnel)</span>
                  </label>
                  <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange}
                    className="bi-input" placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 : Expertise ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="mb-6">
                  <h2 className="text-lg font-black text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                    Domaine d'expertise
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Choisissez parmi les spécialités existantes ou proposez la vôtre
                  </p>
                </div>

                {/* Spécialité dynamique — dropdown custom */}
<div>
  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
    style={{ color: 'rgba(167,139,250,0.7)' }}>
    Domaine de spécialité *
  </label>

  <div className="relative" ref={specialityDropdownRef}>
    {/* Trigger */}
    <button type="button"
      onClick={() => setSpecialityOpen(o => !o)}
      className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm text-left transition-all"
      style={{
        background: form.speciality || specialityMode === 'other'
          ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${specialityOpen
          ? 'rgba(139,92,246,0.45)'
          : form.speciality || specialityMode === 'other'
            ? 'rgba(139,92,246,0.25)'
            : 'rgba(139,92,246,0.12)'}`,
        color: form.speciality || specialityMode === 'other'
          ? 'white' : 'rgba(255,255,255,0.3)',
        boxShadow: specialityOpen ? '0 0 0 3px rgba(139,92,246,0.08)' : 'none',
      }}>
      <span className="flex items-center gap-2.5 min-w-0">
        {specialityMode === 'other' ? (
          <>
            <span className="text-purple-400">✦</span>
            <span className="truncate">{otherSpeciality || 'Autre (préciser)'}</span>
          </>
        ) : form.speciality ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#8b5cf6' }} />
            <span className="truncate">{form.speciality}</span>
          </>
        ) : (
          <span>Choisir votre spécialité</span>
        )}
      </span>
      <motion.svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0"
        stroke="rgba(139,92,246,0.5)" strokeWidth="2"
        animate={{ rotate: specialityOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <polyline points="6 9 12 15 18 9"/>
      </motion.svg>
    </button>

    {/* Dropdown panel */}
    <AnimatePresence>
      {specialityOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden"
          style={{
            background: '#0f0c24',
            border: '1px solid rgba(139,92,246,0.2)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}>

          {/* Scrollbar style */}
          <style>{`
            .spec-scroll::-webkit-scrollbar { width: 4px; }
            .spec-scroll::-webkit-scrollbar-track { background: transparent; }
            .spec-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }
          `}</style>

          <div className="spec-scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {categories.map((cat, ci) => (
              <div key={cat.id}>
                {/* Groupe header */}
                <div className="flex items-center gap-2 px-4 py-2 sticky top-0"
                  style={{
                    background: 'rgba(139,92,246,0.06)',
                    borderBottom: '1px solid rgba(139,92,246,0.08)',
                    borderTop: ci > 0 ? '1px solid rgba(139,92,246,0.06)' : 'none',
                  }}>
                  <div className="w-1 h-3 rounded-full" style={{ background: 'rgba(139,92,246,0.5)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: 'rgba(167,139,250,0.6)' }}>
                    {cat.name}
                  </span>
                </div>

                {/* Sous-catégories */}
                {cat.subCategories?.map(sub => (
                  <button key={sub.id} type="button"
                    onClick={() => {
                      setForm({ ...form, speciality: sub.name });
                      setSpecialityMode('select');
                      setSpecialityOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-5 py-2.5 transition-all"
                    style={{
                      background: form.speciality === sub.name
                        ? 'rgba(139,92,246,0.12)' : 'transparent',
                      color: form.speciality === sub.name
                        ? 'white' : 'rgba(255,255,255,0.55)',
                      fontSize: '13px',
                    }}
                    onMouseEnter={e => {
                      if (form.speciality !== sub.name)
                        e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                    }}
                    onMouseLeave={e => {
                      if (form.speciality !== sub.name)
                        e.currentTarget.style.background = 'transparent';
                    }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: form.speciality === sub.name ? '#8b5cf6' : 'rgba(255,255,255,0.2)' }} />
                    <span className="flex-1">{sub.name}</span>
                    {form.speciality === sub.name && (
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0"
                        stroke="#a78bfa" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                ))}

                {/* Catégorie sans sous-catégories */}
                {(!cat.subCategories || cat.subCategories.length === 0) && (
                  <button type="button"
                    onClick={() => {
                      setForm({ ...form, speciality: cat.name });
                      setSpecialityMode('select');
                      setSpecialityOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-5 py-2.5 transition-all"
                    style={{
                      background: form.speciality === cat.name
                        ? 'rgba(139,92,246,0.12)' : 'transparent',
                      color: form.speciality === cat.name
                        ? 'white' : 'rgba(255,255,255,0.55)',
                      fontSize: '13px',
                    }}
                    onMouseEnter={e => {
                      if (form.speciality !== cat.name)
                        e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                    }}
                    onMouseLeave={e => {
                      if (form.speciality !== cat.name)
                        e.currentTarget.style.background = 'transparent';
                    }}>
                    <span className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: form.speciality === cat.name ? '#8b5cf6' : 'rgba(255,255,255,0.2)' }} />
                    <span className="flex-1">{cat.name}</span>
                    {form.speciality === cat.name && (
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0"
                        stroke="#a78bfa" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}

            {/* Séparateur + Autre */}
            <div style={{ borderTop: '1px solid rgba(139,92,246,0.12)', margin: '4px 0' }} />
            <button type="button"
              onClick={() => {
                setSpecialityMode('other');
                setForm({ ...form, speciality: '' });
                setSpecialityOpen(false);
              }}
              className="w-full text-left flex items-center gap-3 px-5 py-3 transition-all"
              style={{
                background: specialityMode === 'other' ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: specialityMode === 'other' ? '#a78bfa' : 'rgba(167,139,250,0.6)',
                fontSize: '13px',
                fontWeight: 600,
              }}
              onMouseEnter={e => {
                if (specialityMode !== 'other')
                  e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
              }}
              onMouseLeave={e => {
                if (specialityMode !== 'other')
                  e.currentTarget.style.background = 'transparent';
              }}>
              <span style={{ fontSize: '12px' }}>✦</span>
              Autre — préciser ma spécialité
              {specialityMode === 'other' && (
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 ml-auto flex-shrink-0"
                  stroke="#a78bfa" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>

  {/* Champ libre si "Autre" */}
  <AnimatePresence>
    {specialityMode === 'other' && (
      <motion.div
        initial={{ opacity: 0, height: 0, marginTop: 0 }}
        animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
        exit={{ opacity: 0, height: 0, marginTop: 0 }}>
        <div className="relative">
          <input
            value={otherSpeciality}
            onChange={e => setOtherSpeciality(e.target.value)}
            className="bi-input pl-10"
            placeholder="Décrivez votre spécialité..."
            autoFocus
          />
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            stroke="rgba(139,92,246,0.5)" strokeWidth="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Votre spécialité sera ajoutée si votre candidature est approuvée.
        </p>
      </motion.div>
    )}
  </AnimatePresence>
</div>

                {/* Expérience */}
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                    style={{ color: 'rgba(167,139,250,0.7)' }}>
                    Années d'expérience *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: "Moins d'1 an", label: '< 1 an' },
                      { value: '1-2 ans',       label: '1–2 ans' },
                      { value: '3-5 ans',       label: '3–5 ans' },
                      { value: '5-10 ans',      label: '5–10 ans' },
                      { value: 'Plus de 10 ans', label: '10+ ans' },
                    ].map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm({ ...form, experience: opt.value })}
                        className="py-2.5 rounded-xl text-[11px] font-bold transition-all"
                        style={form.experience === opt.value ? {
                          background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                          color: 'white',
                          boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                        } : {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'rgba(255,255,255,0.4)',
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aperçu profil */}
                <AnimatePresence>
                  {(displaySpeciality || form.speciality) && form.experience && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(139,92,246,0.2)' }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="#a78bfa" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {displaySpeciality || form.speciality}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#a78bfa' }}>
                          {form.experience} · {form.educationLevel}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── ÉTAPE 3 : Dossier ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h2 className="text-lg font-black text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                    Lettre de motivation
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Joignez votre lettre de motivation en PDF ou Word (max 5 Mo)
                  </p>
                </div>

                {/* Zone upload */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  className="relative rounded-2xl cursor-pointer transition-all duration-200 mb-5"
                  style={{
                    border: `2px dashed ${motivationFile ? 'rgba(139,92,246,0.5)' : dragOver ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.15)'}`,
                    background: motivationFile ? 'rgba(139,92,246,0.06)' : dragOver ? 'rgba(139,92,246,0.04)' : 'rgba(255,255,255,0.02)',
                    padding: '36px 24px',
                  }}>
                  <input ref={fileRef} type="file" className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={e => handleFile(e.target.files[0])} />

                  <AnimatePresence mode="wait">
                    {motivationFile ? (
                      <motion.div key="file"
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="#a78bfa" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{motivationFile.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            {(motivationFile.size / 1024).toFixed(0)} Ko · Cliquer pour remplacer
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(139,92,246,0.15)' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="#a78bfa" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="empty"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="rgba(139,92,246,0.6)" strokeWidth="1.5">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </div>
                        <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          Glissez votre fichier ici
                        </p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          ou cliquez pour parcourir · PDF, DOC, DOCX · max 5 Mo
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Récap */}
                <div className="rounded-2xl p-5 mb-6"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4"
                    style={{ color: 'rgba(167,139,250,0.5)' }}>
                    Récapitulatif
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Nom', value: form.fullName },
                      { label: 'Email', value: form.email },
                      { label: 'Spécialité', value: displaySpeciality || form.speciality },
                      { label: 'Expérience', value: form.experience },
                      { label: 'Niveau', value: form.educationLevel },
                      { label: 'Téléphone', value: form.phone },
                    ].map(item => (
                      <div key={item.label} className="min-w-0">
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {item.label}
                        </p>
                        <p className="text-xs font-medium text-white truncate">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button type="submit" disabled={loading || !motivationFile}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-4 rounded-2xl font-black text-white text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                    boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
                    letterSpacing: '0.01em',
                  }}>
                  {loading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full"
                        style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Soumettre ma candidature
                    </>
                  )}
                </motion.button>
              </form>
            )}

            {/* Navigation steps 1 & 2 */}
            {step < 3 && (
              <div className="flex justify-between mt-8 pt-6"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {step > 1 ? (
                  <button onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Précédent
                  </button>
                ) : (
                  <Link to="/"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Retour
                  </Link>
                )}

                <motion.button onClick={handleNext}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                    boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
                  }}>
                  Continuer
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="white" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BecomeInstructorPage;