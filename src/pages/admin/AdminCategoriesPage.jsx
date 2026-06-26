import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { getCategories, createCategory, createSubCategory, deleteCategory } from '../../services/categoryService';
import { resolveMediaUrl } from '../../utils/media';

const Icons = {
  image: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2"/></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  upload: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
};

const AdminCategoriesPage = () => {
  const { dark } = useTheme();
  const fileInputRef = useRef(null);
  const subFileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [form, setForm] = useState({ name: '' });
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const [subForm, setSubForm] = useState({ parentId: null, name: '' });
  const [subFile, setSubFile] = useState(null);
  const [creatingSub, setCreatingSub] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const cardBg = dark ? 'rgba(255,255,255,0.04)' : '#ffffff';
  const cardBorder = dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb';
  const accent = '#6366f1';
  const accentLight = dark ? '#a5b4fc' : '#4338ca';
  const labelColor = dark ? 'rgba(165,180,252,0.8)' : '#4338ca';

  const inputStyle = {
    background: dark ? 'rgba(99,102,241,0.06)' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : '#e5e7eb'}`,
    borderRadius: '12px',
    color: textPrimary,
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
  };

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try { setCategories(await getCategories()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true); setError(''); setSuccess('');
    try {
      await createCategory(form.name, file);
      setForm({ name: '' }); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess('Catégorie créée !');
      loadCategories();
      setTimeout(() => setSuccess(''), 2500);
    } catch {
      setError('Erreur lors de la création');
    } finally { setCreating(false); }
  };

  const handleCreateSubCategory = async (e) => {
    e.preventDefault();
    if (!subForm.name.trim() || !subForm.parentId) return;
    setCreatingSub(true); setError('');
    try {
      await createSubCategory(subForm.parentId, subForm.name, subFile);
      setSubForm({ parentId: null, name: '' }); setSubFile(null);
      if (subFileInputRef.current) subFileInputRef.current.value = '';
      loadCategories();
    } catch {
      setError("Erreur lors de la création de la sous-catégorie");
    } finally { setCreatingSub(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ? Cette action est irréversible.')) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch {
      setError("Erreur lors de la suppression (vérifie qu'aucune formation ne l'utilise)");
    }
  };

  return (
    <AdminLayout>
      <style>{`
        .ac-input:focus {
          border-color: rgba(99,102,241,0.55) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
      `}</style>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Catégories</h1>
        <p className="text-sm mt-1" style={{ color: textSub }}>
          Gère les catégories et sous-catégories de formations
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-5 text-sm flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
            {Icons.warn} {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-5 text-sm flex items-center gap-2"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
            {Icons.check} {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 p-6 rounded-3xl h-fit"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="h-0.5 rounded-full mb-5 -mt-1"
            style={{ background: `linear-gradient(to right, ${accent}, #4f46e5)` }} />
          <h2 className="font-bold text-base mb-5" style={{ color: textPrimary }}>Nouvelle catégorie</h2>

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: labelColor }}>
                Nom
              </label>
              <input value={form.name} onChange={e => setForm({ name: e.target.value })}
                className="ac-input" style={inputStyle} placeholder="Ex: Informatique" required />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: labelColor }}>
                Photo
              </label>
              <div onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl p-5 text-center cursor-pointer"
                style={{
                  background: dark ? 'rgba(99,102,241,0.04)' : '#f9fafb',
                  border: `2px dashed ${file ? 'rgba(99,102,241,0.4)' : (dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb')}`,
                }}>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <p className="text-xs font-medium" style={{ color: accentLight }}>{file.name}</p>
                ) : (
                  <>
                    <div className="flex justify-center mb-2" style={{ color: textSub, opacity: 0.6 }}>{Icons.upload}</div>
                    <p className="text-xs" style={{ color: textSub }}>Cliquez pour choisir une image</p>
                  </>
                )}
              </div>
            </div>

            <motion.button type="submit" disabled={creating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${accent}, #4f46e5)`, boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
              {creating ? 'Création...' : 'Créer la catégorie'}
            </motion.button>
          </form>
        </motion.div>

        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: cardBg, border: `1px solid ${cardBorder}` }} />
            ))
          ) : categories.length === 0 ? (
            <div className="text-center py-16 rounded-3xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <p className="text-sm" style={{ color: textSub }}>Aucune catégorie pour le moment</p>
            </div>
          ) : categories.map(cat => {
            const isExpanded = expanded === cat.id;
            return (
              <motion.div key={cat.id} layout
                className="rounded-2xl overflow-hidden"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

                <div className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: dark ? 'rgba(99,102,241,0.1)' : '#f3f4f6' }}>
                    {cat.imageUrl ? (
                      <img
                        src={resolveMediaUrl(cat.imageUrl)}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ color: textSub }}>{Icons.image}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: textPrimary }}>{cat.name}</p>
                    <p className="text-xs" style={{ color: textSub }}>
                      {cat.subCategories?.length || 0} sous-catégorie(s)
                    </p>
                  </div>

                  <button onClick={() => setExpanded(isExpanded ? null : cat.id)}
                    className="p-2 rounded-lg transition"
                    style={{ color: accentLight, background: isExpanded ? 'rgba(99,102,241,0.12)' : 'transparent' }}>
                    <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="block">
                      {Icons.chevron}
                    </motion.span>
                  </button>

                  <button onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-lg transition"
                    style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.08)' }}>
                    {Icons.trash}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div className="p-4 pt-0 space-y-2" style={{ borderTop: `1px solid ${cardBorder}` }}>

                        {cat.subCategories?.map(sub => (
                          <div key={sub.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                            style={{ background: dark ? 'rgba(255,255,255,0.02)' : '#f9fafb' }}>
                            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                              style={{ background: dark ? 'rgba(99,102,241,0.1)' : '#f3f4f6' }}>
                              {sub.imageUrl ? (
                                <img
                                  src={resolveMediaUrl(sub.imageUrl)}
                                  alt={sub.name}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <span style={{ color: textSub, transform: 'scale(0.7)' }}>{Icons.image}</span>
                              )}
                            </div>
                            <span className="flex-1 text-sm" style={{ color: textPrimary }}>{sub.name}</span>
                            <button onClick={() => handleDelete(sub.id)}
                              className="p-1.5 rounded-lg" style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.08)' }}>
                              {Icons.trash}
                            </button>
                          </div>
                        ))}

                        {subForm.parentId === cat.id ? (
                          <form onSubmit={handleCreateSubCategory}
                            className="flex flex-col gap-2 p-3 rounded-xl mt-2"
                            style={{ background: dark ? 'rgba(99,102,241,0.05)' : '#f3f4f6' }}>
                            <input autoFocus value={subForm.name}
                              onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                              className="ac-input" style={{ ...inputStyle, padding: '8px 12px' }}
                              placeholder="Nom de la sous-catégorie" required />
                            <div className="flex items-center gap-2">
                              <input ref={subFileInputRef} type="file" accept="image/*"
                                onChange={e => setSubFile(e.target.files[0])}
                                className="text-xs flex-1" style={{ color: textSub }} />
                              <button type="submit" disabled={creatingSub}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                                style={{ background: accent }}>
                                {creatingSub ? '...' : 'Ajouter'}
                              </button>
                              <button type="button"
                                onClick={() => { setSubForm({ parentId: null, name: '' }); setSubFile(null); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                style={{ color: textSub, background: 'transparent' }}>
                                Annuler
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => setSubForm({ parentId: cat.id, name: '' })}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl mt-1"
                            style={{ color: accentLight, background: 'rgba(99,102,241,0.08)' }}>
                            {Icons.plus} Ajouter une sous-catégorie
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;