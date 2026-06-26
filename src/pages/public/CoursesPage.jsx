import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Layout from '../../components/Layout';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { getApprovedCourses, searchCourses } from '../../services/courseService';
import { getCategories, getCoursesByCategory } from '../../services/categoryService';
import { resolveMediaUrl } from '../../utils/media';

const CategoryIcon = ({ name, size = 14 }) => {
  const icons = {
    'Informatique': <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    'Nutrition': <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    'Sport': <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>,
    'Langues': <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
    'Business': <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
    'default': <svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  };
  return icons[name] || icons['default'];
};

const StarRow = ({ rating, dim }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <span key={s} className="text-xs" style={{ color: s <= Math.round(rating) ? '#f59e0b' : dim }}>★</span>
    ))}
  </div>
);

const LEVELS = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];

const CategoryTile = ({ item, subtitle, t, index, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}>
    <motion.div
      whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(item)}
      className="group w-full flex flex-col text-left rounded-2xl overflow-hidden cursor-pointer"
      style={{ border: `1px solid ${t.border}`, background: t.surface, boxShadow: t.shadow }}>
      <div className="w-full h-24 relative overflow-hidden">
        {item.imageUrl ? (
          <img src={resolveMediaUrl(item.imageUrl)} alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: t.surfaceSub }}>
            <span style={{ color: t.textSub, opacity: 0.5 }}><CategoryIcon name={item.name} size={26} /></span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent 55%)' }} />
        <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ background: t.accent }}>
          <CategoryIcon name={item.name} size={11} />
        </div>
      </div>
      <div className="p-3">
        <span className="text-[12px] font-semibold block truncate" style={{ color: t.textPrimary }}>
          {item.name}
        </span>
        <span className="text-[10px] mt-0.5 block" style={{ color: subtitle.accent ? t.accent : t.textSub }}>
          {subtitle.text}
        </span>
      </div>
    </motion.div>
  </motion.div>
);

const CourseCard = ({ course, index, t, tag }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.4 }}
    whileHover={{ y: -5 }}
    className="group rounded-2xl overflow-hidden flex flex-col"
    style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
    <Link to={`/courses/${course.id}`} className="flex flex-col h-full">
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        {course.imageUrl ? (
          <img src={resolveMediaUrl(course.imageUrl)} alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: t.surfaceSub }}>
            <span style={{ color: t.textSub, opacity: 0.4 }}><CategoryIcon name={course.categoryName} size={32} /></span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'rgba(255,255,255,0.92)', color: t.accent }}>
            {course.categoryName || 'Général'}
          </span>
          {tag && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
              style={{ background: tag.bg }}>
              {tag.label}
            </span>
          )}
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style={{ background: t.accent }}>
              {course.instructorName?.charAt(0)}
            </div>
            <span className="text-[11px] font-medium text-white truncate max-w-[120px]"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {course.instructorName}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}>
            {course.level || 'Tous niveaux'}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[13px] font-semibold mb-1 line-clamp-2" style={{ color: t.textPrimary }}>
          {course.title}
        </h3>
        <p className="text-[11px] mb-3 line-clamp-2 flex-1" style={{ color: t.textSub }}>
          {course.description}
        </p>
        {course.totalRatings > 0 ? (
          <div className="flex items-center gap-1.5 mb-3">
            <StarRow rating={course.averageRating}
              dim={t.dark ? 'rgba(255,255,255,0.15)' : '#e5e7eb'} />
            <span className="text-[11px] font-bold" style={{ color: '#f59e0b' }}>{course.averageRating}</span>
            <span className="text-[11px]" style={{ color: t.textSub }}>({course.totalRatings})</span>
          </div>
        ) : (
          <p className="text-[11px] mb-3" style={{ color: t.textSub }}>Pas encore noté</p>
        )}
        <div className="flex justify-end pt-2.5" style={{ borderTop: `1px solid ${t.border}` }}>
          <span className="text-[12px] font-semibold flex items-center gap-1 transition-transform group-hover:translate-x-1"
            style={{ color: t.accent }}>
            Voir le cours
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

const CoursesPage = () => {
  const { user } = useAuth();
  const { dark } = useTheme();

  const [categories, setCategories] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCourses, setSubCourses] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [levelFilter, setLevelFilter] = useState('Tous');
  const [previewCategory, setPreviewCategory] = useState(null);
  const [previewSubCategory, setPreviewSubCategory] = useState(null);
  const [previewCourses, setPreviewCourses] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isLearner = user?.role === 'LEARNER';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const Wrapper = isLearner ? LearnerLayout : isInstructor ? InstructorLayout : Layout;

  // ── Tokens unifiés — s'adaptent au rôle ET au thème
  const baseAccent = isInstructor ? '#10b981' : '#8b5cf6';
  const t = {
    dark,
    textPrimary:  dark ? '#ffffff'                : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.5)'  : '#6b7280',
    surface:      dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    surfaceSub:   dark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
    border:       dark ? 'rgba(255,255,255,0.08)' : '#ebebeb',
    shadow:       dark ? 'none'                   : '0 1px 12px rgba(0,0,0,0.05)',
    accent:       baseAccent,
    accentBg:     dark ? `${baseAccent}20`        : `${baseAccent}12`,
    accentBorder: dark ? `${baseAccent}40`        : `${baseAccent}25`,
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getCategories(), getApprovedCourses()])
      .then(([cats, crs]) => { setCategories(cats); setAllCourses(crs); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isLeaf = (cat) => !cat.subCategories || cat.subCategories.length === 0;

  const resetToRoot = () => {
    setSelectedCategory(null); setSelectedSubCategory(null); setSubCourses([]);
    setShowAllCourses(false); setSearchResults(null); setKeyword(''); setLevelFilter('Tous');
  };

  const loadSubCourses = async (id) => {
    setSubLoading(true);
    try { setSubCourses(await getCoursesByCategory(id)); }
    catch (err) { console.error(err); }
    finally { setSubLoading(false); }
  };

  const handleCategorySelect = (cat) => {
    setSearchResults(null); setKeyword(''); setShowAllCourses(false); setLevelFilter('Tous');
    setSelectedCategory(cat);
    if (isLeaf(cat)) { setSelectedSubCategory(cat); loadSubCourses(cat.id); }
    else setSelectedSubCategory(null);
  };

  const handleSubCategorySelect = (sub) => {
    setSelectedSubCategory(sub);
    loadSubCourses(sub.id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) { setSearchResults(null); return; }
    setSelectedCategory(null); setSelectedSubCategory(null); setShowAllCourses(false); setLevelFilter('Tous');
    setSearchLoading(true);
    searchCourses(keyword).then(setSearchResults).catch(console.error).finally(() => setSearchLoading(false));
  };

  const openPreview = (cat) => { setPreviewCategory(cat); setPreviewSubCategory(null); setPreviewCourses([]); };
  const closePreview = () => { setPreviewCategory(null); setPreviewSubCategory(null); setPreviewCourses([]); };
  const openPreviewSub = async (sub) => {
    setPreviewSubCategory(sub); setPreviewLoading(true);
    try { setPreviewCourses(await getCoursesByCategory(sub.id)); }
    catch (err) { console.error(err); }
    finally { setPreviewLoading(false); }
  };
  const backPreviewSub = () => { setPreviewSubCategory(null); setPreviewCourses([]); };

  const getTag = (course) => {
    if (course.totalRatings === 0) return { label: 'Nouveau', bg: `${baseAccent}cc` };
    if (course.averageRating >= 4.5) return { label: 'Top noté', bg: 'rgba(245,158,11,0.9)' };
    return null;
  };

  const applyLevelFilter = (list) => levelFilter === 'Tous' ? list : list.filter(c => c.level === levelFilter);

  const featured = [...allCourses].sort((a, b) => {
    if ((b.totalRatings > 0) !== (a.totalRatings > 0)) return (b.totalRatings > 0) - (a.totalRatings > 0);
    if (b.averageRating !== a.averageRating) return (b.averageRating || 0) - (a.averageRating || 0);
    return b.id - a.id;
  }).slice(0, 6);

  const mode = searchResults !== null ? 'search'
    : showAllCourses ? 'all'
    : selectedSubCategory ? 'courses'
    : selectedCategory ? 'subcategories'
    : 'root';

  const headerSubtitle = {
    root: `${allCourses.length} formation(s) disponibles`,
    subcategories: `${selectedCategory?.subCategories?.length || 0} sous-catégorie(s)`,
    courses: `${subCourses.length} formation(s)${selectedSubCategory ? ` · ${selectedSubCategory.name}` : ''}`,
    all: `${allCourses.length} formation(s) au total`,
    search: searchLoading ? 'Recherche...' : `${(searchResults || []).length} résultat(s) pour "${keyword}"`,
  }[mode];

  const Skeleton = () => (
    <div className="rounded-2xl animate-pulse h-[260px]"
      style={{ background: t.surface, border: `1px solid ${t.border}` }} />
  );

  return (
    <Wrapper>
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold mb-1" style={{ color: t.textPrimary }}>
          Formations
        </h1>
        <p className="text-[13px]" style={{ color: t.textSub }}>{headerSubtitle}</p>
      </div>

      {/* ── Recherche ── */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <svg viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
            stroke={t.textSub} strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
            placeholder="Rechercher une formation, une compétence..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[13px] outline-none"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              color: t.textPrimary,
              boxShadow: t.shadow,
            }} />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
          className="px-5 py-2.5 rounded-xl font-semibold text-white text-[13px]"
          style={{ background: t.accent }}>
          Rechercher
        </motion.button>
      </form>

      {/* ── Fil d'Ariane ── */}
      {mode !== 'root' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-5 text-[13px] flex-wrap">
          <button onClick={resetToRoot}
            className="font-medium transition-opacity hover:opacity-60"
            style={{ color: t.accent }}>
            Formations
          </button>
          {mode === 'all' && (
            <><span style={{ color: t.textSub }}>›</span>
            <span className="font-semibold" style={{ color: t.textPrimary }}>Toutes</span></>
          )}
          {mode === 'search' && (
            <><span style={{ color: t.textSub }}>›</span>
            <span className="font-semibold" style={{ color: t.textPrimary }}>"{keyword}"</span></>
          )}
          {(mode === 'subcategories' || mode === 'courses') && selectedCategory && (
            <>
              <span style={{ color: t.textSub }}>›</span>
              <button
                onClick={() => { if (isLeaf(selectedCategory)) resetToRoot(); else setSelectedSubCategory(null); }}
                className="transition-opacity hover:opacity-60"
                style={{ color: mode === 'subcategories' ? t.textPrimary : t.accent, fontWeight: mode === 'subcategories' ? 600 : 500 }}>
                {selectedCategory.name}
              </button>
            </>
          )}
          {mode === 'courses' && selectedSubCategory && selectedSubCategory.id !== selectedCategory?.id && (
            <><span style={{ color: t.textSub }}>›</span>
            <span className="font-semibold" style={{ color: t.textPrimary }}>{selectedSubCategory.name}</span></>
          )}
        </motion.div>
      )}

      {/* ── Filtre niveau ── */}
      {(mode === 'courses' || mode === 'all' || mode === 'search') && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-widest mr-1" style={{ color: t.textSub }}>
            Niveau
          </span>
          {LEVELS.map(lvl => (
            <button key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={levelFilter === lvl ? {
                background: t.accent, color: 'white',
              } : {
                background: t.surface,
                border: `1px solid ${t.border}`,
                color: t.textSub,
              }}>
              {lvl}
            </button>
          ))}
        </div>
      )}

      {/* ══ MODE ROOT ══ */}
      {mode === 'root' && (
        <>
          {/* Catégories */}
          <div className="mb-10">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: t.textSub }}>
              Naviguer par catégorie
            </p>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-32 rounded-2xl animate-pulse"
                    style={{ background: t.surface, border: `1px solid ${t.border}` }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((cat, i) => {
                  const hasSubs = !isLeaf(cat);
                  return (
                    <CategoryTile key={cat.id} item={cat} index={i} t={t}
                      subtitle={{ text: hasSubs ? `${cat.subCategories.length} sous-catégories` : 'Voir les formations →', accent: !hasSubs }}
                      onSelect={handleCategorySelect} />
                  );
                })}
              </div>
            )}
          </div>

          {/* Formations mises en avant */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold" style={{ color: t.textPrimary }}>
                Formations mises en avant
              </h2>
              <button onClick={() => setShowAllCourses(true)}
                className="text-[12px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-60"
                style={{ color: t.accent }}>
                Voir tout
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map(i => <Skeleton key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((course, i) => (
                  <CourseCard key={course.id} course={course} index={i} tag={getTag(course)} t={t} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ MODE SUBCATEGORIES ══ */}
      {mode === 'subcategories' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {selectedCategory.subCategories.map((sub, i) => (
            <CategoryTile key={sub.id} item={sub} index={i} t={t}
              subtitle={{ text: 'Voir les formations →', accent: true }}
              onSelect={handleSubCategorySelect} />
          ))}
        </div>
      )}

      {/* ══ MODE COURSES / ALL / SEARCH ══ */}
      {(mode === 'courses' || mode === 'all' || mode === 'search') && (() => {
        const sourceList = mode === 'courses' ? subCourses : mode === 'all' ? allCourses : (searchResults || []);
        const isLoadingList = mode === 'courses' ? subLoading : mode === 'search' ? searchLoading : loading;
        const list = applyLevelFilter(sourceList);

        if (isLoadingList) return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
          </div>
        );

        if (list.length === 0) return (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: t.accentBg }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={t.accent} strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold mb-1" style={{ color: t.textPrimary }}>
              Aucune formation trouvée
            </h3>
            <p className="text-[13px] mb-5" style={{ color: t.textSub }}>
              Essayez d'autres mots-clés ou explorez les catégories
            </p>
            <button onClick={resetToRoot}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold"
              style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accent }}>
              Retour aux catégories
            </button>
          </div>
        );

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {list.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} tag={getTag(course)} t={t} />
              ))}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* ══ POPUP APERÇU RAPIDE ══ */}
      <AnimatePresence>
        {previewCategory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={closePreview}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: dark ? '#13131a' : '#ffffff',
                border: `1px solid ${t.border}`,
                boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
              }}>
              <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
                style={{ borderBottom: `1px solid ${t.border}` }}>
                {previewSubCategory && (
                  <button onClick={backPreviewSub}
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: t.accentBg, color: t.accent }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                  </button>
                )}
                <div className="flex-1">
                  <p className="text-[11px]" style={{ color: t.textSub }}>
                    {previewSubCategory ? previewCategory.name : 'Aperçu rapide'}
                  </p>
                  <h2 className="text-[15px] font-semibold" style={{ color: t.textPrimary }}>
                    {previewSubCategory ? previewSubCategory.name : previewCategory.name}
                  </h2>
                </div>
                <button onClick={closePreview}
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: t.surfaceSub, color: t.textSub }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                {!previewSubCategory ? (
                  isLeaf(previewCategory) ? (
                    <p className="text-center py-10 text-[13px]" style={{ color: t.textSub }}>
                      <button onClick={() => { closePreview(); handleCategorySelect(previewCategory); }}
                        style={{ color: t.accent }} className="font-semibold">
                        Voir les formations →
                      </button>
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {previewCategory.subCategories.map(sub => (
                        <motion.button key={sub.id} whileHover={{ y: -2 }} onClick={() => openPreviewSub(sub)}
                          className="rounded-xl overflow-hidden text-left"
                          style={{ border: `1px solid ${t.border}`, background: t.surface }}>
                          <div className="w-full h-20" style={{ background: t.surfaceSub }}>
                            {sub.imageUrl
                              ? <img src={resolveMediaUrl(sub.imageUrl)} alt={sub.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <span style={{ color: t.textSub }}><CategoryIcon name={sub.name} size={20} /></span>
                                </div>
                            }
                          </div>
                          <div className="p-2.5">
                            <span className="text-[12px] font-semibold" style={{ color: t.textPrimary }}>{sub.name}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )
                ) : previewLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-40 rounded-xl animate-pulse" style={{ background: t.surface }} />
                    ))}
                  </div>
                ) : previewCourses.length === 0 ? (
                  <div className="text-center py-14">
                    <p className="text-[13px]" style={{ color: t.textSub }}>Aucune formation disponible</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {previewCourses.map(course => (
                      <Link key={course.id} to={`/courses/${course.id}`} onClick={closePreview}
                        className="rounded-xl overflow-hidden flex flex-col"
                        style={{ border: `1px solid ${t.border}`, background: t.surface }}>
                        <div className="w-full h-28">
                          {course.imageUrl
                            ? <img src={resolveMediaUrl(course.imageUrl)} alt={course.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full" style={{ background: t.surfaceSub }} />
                          }
                        </div>
                        <div className="p-3">
                          <h4 className="text-[12px] font-semibold mb-1 line-clamp-2" style={{ color: t.textPrimary }}>
                            {course.title}
                          </h4>
                          <p className="text-[10px]" style={{ color: t.textSub }}>
                            Par {course.instructorName} · {course.level}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default CoursesPage;