import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { useTheme } from '../../context/ThemeContext';
import { createCourse } from '../../services/courseService';
import { getCategories } from '../../services/categoryService';
import { createCategoryRequest } from '../../services/categoryRequestService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark, faCheck, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const CategoryIcon = ({ size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

const levelConfig = [
  { value: 'Débutant',      color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)'  },
  { value: 'Intermédiaire', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)'  },
  { value: 'Avancé',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'   },
];

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [form, setForm] = useState({ title: '', description: '', level: 'Débutant', categoryId: '' });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [levelOpen, setLevelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ categoryName: '', subCategoryName: '', reason: '' });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState('');

  const t = {
    textPrimary:  dark ? '#ffffff'                 : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.45)'  : '#6b7280',
    surface:      dark ? '#0d1a14'                 : '#ffffff',
    border:       dark ? 'rgba(16,185,129,0.15)'   : '#e5e7eb',
    accent:       '#10b981',
    accentText:   dark ? '#6ee7b7'                 : '#059669',
    accentLabel:  dark ? 'rgba(16,185,129,0.7)'    : '#059669',
    innerBg:      dark ? 'rgba(16,185,129,0.06)'   : '#f9fafb',
    innerBorder:  dark ? 'rgba(16,185,129,0.2)'    : '#d1fae5',
    shadow:       dark ? 'none'                    : '0 2px 12px rgba(0,0,0,0.04)',
    dropdownBg:   dark ? '#0d1a14'                 : '#ffffff',
    optionColor:  dark ? 'rgba(255,255,255,0.75)'  : '#374151',
    imageBg:      dark ? 'rgba(16,185,129,0.04)'   : '#f9fafb',
  };

  const inputStyle = {
    background: t.innerBg,
    border: `1px solid ${t.innerBorder}`,
    borderRadius: '14px',
    color: t.textPrimary,
    width: '100%',
    padding: '14px 18px',
    fontSize: '14px',
    outline: 'none',
  };

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    const handler = () => { setLevelOpen(false); setCategoryOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.categoryId) { setError('Veuillez choisir une catégorie'); return; }
    if (!imageFile) { setError('Veuillez ajouter une photo de couverture'); return; }
    setLoading(true); setError('');
    try {
      await createCourse({ ...form, categoryId: Number(form.categoryId) }, imageFile);
      navigate('/instructor/dashboard');
    } catch { setError('Erreur lors de la création'); }
    finally { setLoading(false); }
  };

  const handleSendRequest = async () => {
    if (!requestForm.categoryName.trim()) { setRequestError('Le nom de la catégorie est requis'); return; }
    setRequestLoading(true); setRequestError('');
    try { await createCategoryRequest(requestForm); setRequestSent(true); }
    catch (err) { setRequestError(err?.response?.data?.message || "Erreur lors de l'envoi"); }
    finally { setRequestLoading(false); }
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setRequestForm({ categoryName: '', subCategoryName: '', reason: '' });
    setRequestSent(false); setRequestError('');
  };

  const selectedLevel = levelConfig.find(l => l.value === form.level) || levelConfig[0];
  const selectedCategory = categories.flatMap(c => c.subCategories || []).find(sub => sub.id === Number(form.categoryId));

  return (
    <InstructorLayout>
      <style>{`
        .ci-input:focus { border-color: rgba(16,185,129,0.55) !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .ci-input::placeholder { color: ${dark ? 'rgba(255,255,255,0.22)' : '#9ca3af'}; }
        .ci-dropdown { background: ${t.dropdownBg}; border: 1px solid ${t.innerBorder}; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 40px ${dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}; }
        .ci-option { padding: 11px 16px; cursor: pointer; font-size: 14px; color: ${t.optionColor}; transition: background 0.15s; display: flex; align-items: center; gap: 10px; }
        .ci-option:hover { background: rgba(16,185,129,0.1); color: ${t.accentText}; }
        .ci-option-active { background: rgba(16,185,129,0.15) !important; color: ${t.accentText} !important; }
        .ci-scrollable { max-height: 280px; overflow-y: auto; }
        .ci-scrollable::-webkit-scrollbar { width: 4px; }
        .ci-scrollable::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 2px; }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <button onClick={() => navigate('/instructor/dashboard')}
            className="flex items-center gap-2 text-[13px] mb-4 transition"
            style={{ color: t.accentLabel }}
            onMouseEnter={e => e.currentTarget.style.color = t.accentText}
            onMouseLeave={e => e.currentTarget.style.color = t.accentLabel}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Retour
          </button>
          <h1 className="text-[2rem] font-bold tracking-tight" style={{ color: t.textPrimary, letterSpacing: '-0.025em' }}>
            Créer une formation
          </h1>
          <p className="text-[13px] mt-1" style={{ color: t.textSub }}>Partagez votre expertise avec des milliers d'apprenants</p>
        </motion.div>

        {/* Carte formulaire */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl"
          style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
          <div className="h-0.5 rounded-full mb-7 -mt-1"
            style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-3 rounded-xl mb-5 text-[13px] flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Titre */}
            <div>
              <label className="block text-[11px] font-bold mb-2 uppercase tracking-widest"
                style={{ color: t.accentLabel }}>Titre de la formation *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className="ci-input" style={inputStyle} placeholder="Ex: Spring Boot pour débutants" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold mb-2 uppercase tracking-widest"
                style={{ color: t.accentLabel }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={4} className="ci-input resize-none" style={inputStyle}
                placeholder="Décrivez le contenu et les objectifs de votre formation..." />
            </div>

            {/* Photo couverture */}
            <div>
              <label className="block text-[11px] font-bold mb-2 uppercase tracking-widest"
                style={{ color: t.accentLabel }}>Photo de couverture *</label>
              <div onClick={() => fileInputRef.current?.click()}
                className="relative rounded-2xl cursor-pointer overflow-hidden"
                style={{
                  border: `2px dashed ${imagePreview ? 'rgba(16,185,129,0.4)' : t.innerBorder}`,
                  background: t.imageBg,
                  minHeight: imagePreview ? 'auto' : '140px',
                }}>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                {imagePreview ? (
                  <img src={imagePreview} alt="Aperçu" className="w-full h-48 object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 mb-2" stroke={t.textSub} strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p className="text-[12px]" style={{ color: t.textSub }}>Cliquez pour choisir une image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Niveau + Catégorie */}
            <div className="grid grid-cols-2 gap-4">
              {/* Niveau */}
              <div>
                <label className="block text-[11px] font-bold mb-2 uppercase tracking-widest"
                  style={{ color: t.accentLabel }}>Niveau *</label>
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                  <motion.button type="button" whileTap={{ scale: 0.98 }}
                    onClick={() => { setLevelOpen(!levelOpen); setCategoryOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[13px] font-medium"
                    style={{ background: selectedLevel.bg, border: `1px solid ${selectedLevel.border}`, color: selectedLevel.color }}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: selectedLevel.color }} />
                      {selectedLevel.value}
                    </span>
                    <motion.svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5"
                      animate={{ rotate: levelOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ opacity: 0.6 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </motion.svg>
                  </motion.button>
                  <AnimatePresence>
                    {levelOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="ci-dropdown absolute top-full left-0 right-0 mt-2 z-50">
                        {levelConfig.map(lvl => (
                          <div key={lvl.value}
                            className={`ci-option ${form.level === lvl.value ? 'ci-option-active' : ''}`}
                            onClick={() => { setForm({ ...form, level: lvl.value }); setLevelOpen(false); }}>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: lvl.color }} />
                            <span>{lvl.value}</span>
                            {form.level === lvl.value && (
                              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 ml-auto" stroke={t.accentText} strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-[11px] font-bold mb-2 uppercase tracking-widest"
                  style={{ color: t.accentLabel }}>Catégorie *</label>
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                  <motion.button type="button" whileTap={{ scale: 0.98 }}
                    onClick={() => { setCategoryOpen(!categoryOpen); setLevelOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[13px] font-medium"
                    style={{
                      background: selectedCategory ? 'rgba(16,185,129,0.1)' : t.innerBg,
                      border: `1px solid ${selectedCategory ? 'rgba(16,185,129,0.3)' : t.innerBorder}`,
                      color: selectedCategory ? t.accentText : t.textSub,
                    }}>
                    <span className="flex items-center gap-2 truncate">
                      {selectedCategory ? <><CategoryIcon size={14} /><span className="truncate">{selectedCategory.name}</span></> : <span>-- Choisir --</span>}
                    </span>
                    <motion.svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0" stroke="currentColor" strokeWidth="2.5"
                      animate={{ rotate: categoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ opacity: 0.5 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </motion.svg>
                  </motion.button>
                  <AnimatePresence>
                    {categoryOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="ci-dropdown absolute top-full left-0 right-0 mt-2 z-50">
                        <div className="ci-scrollable">
                          {categories.filter(p => p.subCategories?.length > 0).map(parent => (
                            <div key={parent.id}>
                              <div className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest"
                                style={{ color: t.textSub, opacity: 0.7 }}>{parent.name}</div>
                              {parent.subCategories.map(sub => (
                                <div key={sub.id}
                                  className={`ci-option ${Number(form.categoryId) === sub.id ? 'ci-option-active' : ''}`}
                                  style={{ paddingLeft: '28px' }}
                                  onClick={() => { setForm({ ...form, categoryId: sub.id }); setCategoryOpen(false); }}>
                                  <CategoryIcon size={14} />
                                  <span className="flex-1">{sub.name}</span>
                                  {Number(form.categoryId) === sub.id && (
                                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke={t.accentText} strokeWidth="2.5">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Demander catégorie */}
            <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setShowRequestModal(true)}
              className="w-full py-3 rounded-2xl text-[13px] font-semibold flex items-center justify-center gap-2"
              style={{
                background: dark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                border: `1px dashed ${dark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.25)'}`,
                color: t.accentText,
              }}>
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />
              Ma catégorie n'existe pas — en demander une nouvelle
            </motion.button>

            {/* Aperçu catégorie */}
            <AnimatePresence>
              {selectedCategory && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.12)', color: t.accentText }}>
                    <CategoryIcon size={16} />
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: t.accentLabel }}>Catégorie sélectionnée</p>
                    <p className="text-[13px] font-semibold" style={{ color: t.accentText }}>{selectedCategory.name}</p>
                  </div>
                  <span className="ml-auto w-2.5 h-2.5 rounded-full" style={{ background: selectedLevel.color }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white text-[13px] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                {loading ? 'Création...' : 'Créer la formation'}
              </motion.button>
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/instructor/dashboard')}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-[13px]"
                style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6', border: `1px solid ${t.border}`, color: t.textSub }}>
                Annuler
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Modal demande catégorie */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={() => !requestLoading && closeRequestModal()}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }} onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-7"
              style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: dark ? 'none' : '0 24px 60px rgba(0,0,0,0.12)' }}>
              {requestSent ? (
                <div className="text-center py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: 'white', fontSize: 28 }} />
                  </motion.div>
                  <h3 className="font-bold text-[16px] mb-2" style={{ color: t.textPrimary }}>Demande envoyée !</h3>
                  <p className="text-[13px] mb-5" style={{ color: t.textSub }}>L'administration examinera votre demande.</p>
                  <button onClick={closeRequestModal}
                    className="w-full py-3 rounded-xl font-semibold text-white text-[13px]"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={closeRequestModal}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: t.textSub }}>
                      <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
                    </button>
                    <div>
                      <h3 className="font-bold text-[15px]" style={{ color: t.textPrimary }}>Demander une nouvelle catégorie</h3>
                      <p className="text-[12px] mt-0.5" style={{ color: t.textSub }}>L'admin créera la catégorie si approuvée</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'categoryName', label: 'Nom de la catégorie *', placeholder: 'Ex: Design graphique', required: true },
                      { key: 'subCategoryName', label: 'Sous-catégorie (optionnel)', placeholder: 'Ex: Illustrator avancé', required: false },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-widest"
                          style={{ color: t.accentLabel }}>{f.label}</label>
                        <input value={requestForm[f.key]}
                          onChange={e => setRequestForm({ ...requestForm, [f.key]: e.target.value })}
                          placeholder={f.placeholder} className="ci-input"
                          style={{ ...inputStyle, padding: '12px 16px' }} />
                      </div>
                    ))}
                    <div>
                      <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-widest"
                        style={{ color: t.accentLabel }}>Pourquoi cette catégorie ? (optionnel)</label>
                      <textarea value={requestForm.reason}
                        onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                        rows={3} placeholder="Ex: Je forme des apprenants sur Illustrator..."
                        className="ci-input resize-none" style={{ ...inputStyle, padding: '12px 16px' }} />
                    </div>
                    {requestError && <p className="text-[12px] font-medium" style={{ color: '#f87171' }}>{requestError}</p>}
                    <div className="flex gap-3 pt-1">
                      <button onClick={closeRequestModal}
                        className="flex-1 py-3 rounded-xl text-[13px] font-semibold"
                        style={{ color: t.textSub, border: `1px solid ${t.border}` }}>
                        Annuler
                      </button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSendRequest} disabled={requestLoading}
                        className="flex-1 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                        {requestLoading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 rounded-full"
                            style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                        ) : <FontAwesomeIcon icon={faCheck} style={{ fontSize: 11 }} />}
                        {requestLoading ? 'Envoi...' : 'Envoyer'}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </InstructorLayout>
  );
};

export default CreateCoursePage;