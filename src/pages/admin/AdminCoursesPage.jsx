import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { getAllCourses, approveCourse, rejectCourse, archiveCourse, restoreCourse } from '../../services/courseService';
import { getCategories } from '../../services/categoryService';
import { getVideosByCourse } from '../../services/videoService';

const AdminCoursesPage = () => {
  const { dark } = useTheme();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('PENDING'); // 'PENDING' | 'HISTORY' | 'ARCHIVE'
  const [catFilter, setCatFilter] = useState(null); // filtrage par catégorie dans l'historique
  const [previewCourse, setPreviewCourse] = useState(null);
const [previewVideos, setPreviewVideos] = useState([]);
const [previewLoading, setPreviewLoading] = useState(false);

const openPreview = async (course) => {
  setPreviewCourse(course);
  setPreviewVideos([]);
  setPreviewLoading(true);
  try {
    const videos = await getVideosByCourse(course.id);
    setPreviewVideos(videos);
  } catch (err) { console.error(err); }
  finally { setPreviewLoading(false); }
};

const closePreview = () => {
  setPreviewCourse(null);
  setPreviewVideos([]);
};

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const cardBg = dark ? '#0d0d1a' : '#ffffff';
  const cardBorder = dark ? 'rgba(99,102,241,0.12)' : '#e5e7eb';
  const accent = '#6366f1';
  const accentLight = dark ? '#a5b4fc' : '#4338ca';

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    loadCourses();
    setCatFilter(null);
  }, [view]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      // PENDING → actives non archivées
      // HISTORY → actives non archivées (APPROVED ou REJECTED)
      // ARCHIVE → archivées
      const data = await getAllCourses(view === 'ARCHIVE');
      setCourses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    await approveCourse(id);
    // passe en historique → retire du dashboard PENDING
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleReject = async (id) => {
    await rejectCourse(id);
    // passe en historique → retire du dashboard PENDING
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleArchive = async (id) => {
    await archiveCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleRestore = async (id) => {
    await restoreCourse(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Formations filtrées selon la vue active
  const visibleCourses = (() => {
    if (view === 'PENDING') return courses.filter(c => c.status === 'PENDING');
    if (view === 'HISTORY') return courses.filter(c => c.status !== 'PENDING');
    return courses; // ARCHIVE
  })();

  // Groupement par catégorie pour l'historique
  const grouped = (() => {
    let list = visibleCourses;
    if (catFilter) list = list.filter(c => c.categoryId === catFilter || c.categoryName === catFilter);
    const map = {};
    list.forEach(c => {
      const key = c.categoryName || 'Sans catégorie';
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  })();

  // Toutes les catégories présentes dans l'historique
  const historyCategories = (() => {
    const names = [...new Set(visibleCourses.map(c => c.categoryName || 'Sans catégorie'))];
    return names;
  })();

  const statusConfig = {
    APPROVED: {
      bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7',
      icon: <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
      label: 'Approuvé',
    },
    REJECTED: {
      bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5',
      icon: <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
      label: 'Refusé',
    },
    PENDING: {
      bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d',
      icon: <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      label: 'En attente',
    },
  };

  const views = [
    { key: 'PENDING',  label: 'En attente',
      count: courses.filter(c => !c.archived && c.status === 'PENDING').length },
    { key: 'HISTORY',  label: 'Historique',
      count: courses.filter(c => !c.archived && c.status !== 'PENDING').length },
    { key: 'ARCHIVE',  label: 'Archives',
      count: null }, // chargé séparément, pas de count fiable ici
  ];

  const API_BASE = 'http://localhost:8080';

  // Carte formation (partagée entre historique et archive)
  const CourseCard = ({ course }) => {
  const sc = statusConfig[course.status] || statusConfig.PENDING;
  return (
    <motion.div layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

      {/* Miniature cliquable */}
      <button onClick={() => openPreview(course)}
        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center group relative"
        style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6' }}>
        {course.imageUrl
          ? <img src={`${API_BASE}${course.imageUrl}`} alt={course.title} className="w-full h-full object-cover" />
          : <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={textSub} strokeWidth="1.5" style={{ opacity: 0.4 }}>
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
        }
        <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.55)' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      </button>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <button onClick={() => openPreview(course)} className="text-left w-full">
          <p className="font-semibold text-sm truncate hover:underline" style={{ color: textPrimary }}>{course.title}</p>
        </button>
        <p className="text-xs mt-0.5" style={{ color: textSub }}>{course.instructorName} · {course.level}</p>
        <div className="mt-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1"
            style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
            {sc.icon}{sc.label}
          </span>
        </div>
      </div>

      {view === 'ARCHIVE' && course.archivedAt && (
        <div className="text-right flex-shrink-0">
          <p className="text-xs" style={{ color: textSub }}>Archivée le</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: accentLight }}>
            {new Date(course.archivedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      )}

      <div className="flex-shrink-0 flex gap-2">
        {view === 'HISTORY' && (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => handleArchive(course.id)}
            title="Archiver"
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: textSub }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </motion.button>
        )}
        {view === 'ARCHIVE' && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => handleRestore(course.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: accentLight }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            Restaurer
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};



  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Formations</h1>
        <p className="text-sm mt-1" style={{ color: accent }}>
          {view === 'PENDING' && `${visibleCourses.length} formation(s) en attente de validation`}
          {view === 'HISTORY' && `${visibleCourses.length} formation(s) traitée(s)`}
          {view === 'ARCHIVE' && `${visibleCourses.length} formation(s) archivée(s)`}
        </p>
      </div>

      {/* Toggle 3 vues */}
      <div className="flex rounded-2xl p-1 gap-1 mb-8 w-fit"
        style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6', border: `1px solid ${cardBorder}` }}>
        {views.map(v => (
          <button key={v.key} onClick={() => setView(v.key)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            style={view === v.key ? {
              background: `linear-gradient(135deg,${accent},#4f46e5)`,
              color: 'white', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            } : { color: textSub }}>
            {v.label}
            {v.count !== null && (
              <span className="px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: view === v.key ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.15)', color: view === v.key ? 'white' : accentLight }}>
                {v.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: cardBg, border: `1px solid ${cardBorder}` }} />
          ))}
        </div>

      ) : view === 'PENDING' ? (
        /* ─── VUE EN ATTENTE : tableau avec actions approuver/refuser ─── */
        visibleCourses.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 mx-auto mb-3 opacity-20" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="font-semibold" style={{ color: textPrimary }}>Tout est traité !</p>
            <p className="text-sm mt-1" style={{ color: textSub }}>Aucune formation en attente de validation</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}>
            <table className="w-full">
              <thead style={{ borderBottom: `1px solid ${cardBorder}` }}>
                <tr>
                  {['Formation', 'Instructeur', 'Catégorie', 'Niveau', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: accent }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {visibleCourses.map((course, i) => (
                    <motion.tr key={course.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: `1px solid ${cardBorder}` }}
                      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(99,102,241,0.05)' : '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                            style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6' }}>
                            {course.imageUrl
                              ? <img src={`http://localhost:8080${course.imageUrl}`} alt="" className="w-full h-full object-cover" />
                              : <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke={textSub} strokeWidth="1.5" style={{ opacity: 0.4 }}>
                                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                                </svg>
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: textPrimary }}>{course.title}</p>
                            <p className="text-xs mt-0.5 line-clamp-1 max-w-xs" style={{ color: textSub }}>{course.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: textSub }}>{course.instructorName}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: textSub }}>{course.categoryName || '—'}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: textSub }}>{course.level}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.05 }}
                            onClick={() => handleApprove(course.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Approuver
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.05 }}
                            onClick={() => handleReject(course.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Refuser
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )

      ) : view === 'HISTORY' ? (
        /* ─── VUE HISTORIQUE : groupé par catégorie + filtre ─── */
        <>
          {/* Filtre par catégorie */}
          {historyCategories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setCatFilter(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
                style={!catFilter ? {
                  background: `linear-gradient(135deg,${accent},#4f46e5)`, color: 'white',
                } : { background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6', color: textSub, border: `1px solid ${cardBorder}` }}>
                Toutes
              </button>
              {historyCategories.map(name => (
                <button key={name} onClick={() => setCatFilter(name === catFilter ? null : name)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
                  style={catFilter === name ? {
                    background: `linear-gradient(135deg,${accent},#4f46e5)`, color: 'white',
                  } : { background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6', color: textSub, border: `1px solid ${cardBorder}` }}>
                  {name}
                </button>
              ))}
            </div>
          )}

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <p style={{ color: textSub }}>Aucune formation traitée pour le moment</p>
            </div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {Object.entries(grouped).map(([catName, catCourses]) => (
                  <motion.div key={catName} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Titre de groupe */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ background: dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb' }} />
                      <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', color: accentLight, border: `1px solid rgba(99,102,241,0.2)` }}>
                        {catName}
                        <span className="ml-2 opacity-60">{catCourses.length}</span>
                      </span>
                      <div className="h-px flex-1" style={{ background: dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb' }} />
                    </div>

                    {/* Cards */}
                    <div className="space-y-2">
                      <AnimatePresence>
                        {catCourses.map(course => <CourseCard key={course.id} course={course} />)}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>

      ) : (
        /* ─── VUE ARCHIVES ─── */
        visibleCourses.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 mx-auto mb-3 opacity-20" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 8v13H3V8"/><path d="M23 3H1v5h22V3z"/><line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <p className="font-semibold" style={{ color: textPrimary }}>Aucune formation archivée</p>
            <p className="text-sm mt-1" style={{ color: textSub }}>Les formations archivées depuis l'historique apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {visibleCourses.map(course => <CourseCard key={course.id} course={course} />)}
            </AnimatePresence>
          </div>
        )
      )}
      {/* ─── POPUP CONSULTATION FORMATION ─── */}
<AnimatePresence>
  {previewCourse && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={closePreview}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col"
        style={{ background: dark ? '#0d0d1a' : '#ffffff', border: `1px solid ${cardBorder}` }}>

        {/* Header popup */}
        <div className="flex-shrink-0">
          {/* Bannière image */}
          <div className="w-full h-40 relative overflow-hidden"
            style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6' }}>
            {previewCourse.imageUrl
              ? <img src={`${API_BASE}${previewCourse.imageUrl}`} alt={previewCourse.title}
                  className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12" stroke={textSub} strokeWidth="1" style={{ opacity: 0.2 }}>
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
                  </svg>
                </div>
            }
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
            <button onClick={closePreview}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="absolute bottom-3 left-4">
              <h2 className="text-lg font-bold text-white">{previewCourse.title}</h2>
              <p className="text-xs text-white opacity-70">{previewCourse.instructorName} · {previewCourse.level} · {previewCourse.categoryName}</p>
            </div>
          </div>

          {/* Description */}
          {previewCourse.description && (
            <div className="px-5 py-3" style={{ borderBottom: `1px solid ${cardBorder}` }}>
              <p className="text-sm" style={{ color: textSub }}>{previewCourse.description}</p>
            </div>
          )}

          {/* Titre section vidéos */}
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${cardBorder}` }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke={accentLight} strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: textPrimary }}>
              Vidéos
              {previewVideos.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.15)', color: accentLight }}>
                  {previewVideos.length}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Liste vidéos scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {previewLoading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse"
                style={{ background: dark ? 'rgba(99,102,241,0.05)' : '#f3f4f6' }} />
            ))
          ) : previewVideos.length === 0 ? (
            <div className="text-center py-10">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 mx-auto mb-3 opacity-20"
                stroke="currentColor" strokeWidth="1.5">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              <p className="text-sm" style={{ color: textSub }}>Aucune vidéo pour cette formation</p>
            </div>
          ) : (
previewVideos.map((video, i) => (
  <motion.div key={video.id}
    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.05 }}
    className="rounded-xl overflow-hidden"
    style={{ background: dark ? 'rgba(99,102,241,0.05)' : '#f9fafb', border: `1px solid ${cardBorder}` }}>

    {/* Lecteur vidéo */}
    <video
      controls
      controlsList="nodownload"
      className="w-full"
      style={{ maxHeight: '220px', background: '#000' }}
      preload="metadata">
      <source src={`${API_BASE}${video.url}`} type="video/mp4" />
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>

    {/* Infos sous le lecteur */}
    <div className="flex items-center gap-3 p-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(99,102,241,0.15)' }}>
        <span className="text-xs font-bold" style={{ color: accentLight }}>{i + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: textPrimary }}>{video.title}</p>
        <span className="text-xs" style={{
          color: video.status === 'APPROVED' ? '#6ee7b7'
            : video.status === 'REJECTED' ? '#fca5a5' : '#fcd34d'
        }}>
          {video.status === 'APPROVED' ? '✓ Approuvée'
            : video.status === 'REJECTED' ? '✗ Refusée' : '⏳ En attente'}
        </span>
      </div>
    </div>
  </motion.div>
))
          )}
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </AdminLayout>
  );
};

export default AdminCoursesPage;