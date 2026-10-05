import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getMyCourses, archiveCourse, restoreCourse } from '../../services/courseService';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('ACTIVE');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // ── Tokens cohérents avec LearnerDashboard
  const t = {
    textPrimary:  dark ? '#ffffff'                 : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.5)'   : '#6b7280',
    surface:      dark ? 'rgba(255,255,255,0.04)'  : '#ffffff',
    surfaceSub:   dark ? 'rgba(255,255,255,0.02)'  : '#f8f9fa',
    border:       dark ? 'rgba(255,255,255,0.08)'  : '#ebebeb',
    shadow:       dark ? 'none'                    : '0 1px 12px rgba(0,0,0,0.05)',
    rowHover:     dark ? 'rgba(255,255,255,0.03)'  : '#fafafa',
    accent:       '#10b981',
    accentBg:     dark ? 'rgba(16,185,129,0.12)'   : 'rgba(16,185,129,0.07)',
    accentBorder: dark ? 'rgba(16,185,129,0.25)'   : 'rgba(16,185,129,0.18)',
    accentText:   dark ? '#6ee7b7'                 : '#059669',
  };

  useEffect(() => { loadCourses(); }, [view]);

  const loadCourses = async () => {
    setLoading(true);
    try { setCourses(await getMyCourses(view === 'ARCHIVED')); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    await archiveCourse(id);
    setCourses(c => c.filter(x => x.id !== id));
  };

  const handleRestore = async (id, e) => {
    e.stopPropagation();
    await restoreCourse(id);
    setCourses(c => c.filter(x => x.id !== id));
  };

  const total    = courses.length;
  const approved = courses.filter(c => c.status === 'APPROVED').length;
  const pending  = courses.filter(c => c.status === 'PENDING').length;
  const rejected = courses.filter(c => c.status === 'REJECTED').length;

  const statusConfig = {
    APPROVED: { label: 'Approuvé',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  icon: 'fa-circle-check' },
    PENDING:  { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  icon: 'fa-clock'        },
    REJECTED: { label: 'Refusé',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   icon: 'fa-circle-xmark' },
  };

  const StatusBadge = ({ status }) => {
    const s = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
        <i className={`fa-solid ${s.icon} text-[9px]`} />
        {s.label}
      </span>
    );
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const statCards = [
    { label: 'Total cours',  value: total,    icon: 'fa-book-open',    color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.15)'  },
    { label: 'Approuvés',    value: approved, icon: 'fa-circle-check', color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.15)'  },
    { label: 'En attente',   value: pending,  icon: 'fa-clock',        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
    { label: 'Refusés',      value: rejected, icon: 'fa-circle-xmark', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.15)'  },
  ];

  return (
    <InstructorLayout>

      {/* ══ HERO — sans fond coloré ══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
          style={{ color: t.accentText }}>
          Espace instructeur
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[2.2rem] font-bold tracking-tight leading-none mb-2"
              style={{ color: t.textPrimary, letterSpacing: '-0.025em' }}>
              {greeting}, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="text-[14px]" style={{ color: t.textSub }}>
              {approved} cours approuvés
              {pending > 0 && <> · <span style={{ color: '#f59e0b' }}>{pending} en attente</span></>}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/instructor/create-course')}
            className="px-5 py-2.5 rounded-xl font-semibold text-white text-[13px] flex items-center gap-2 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#10b981,#059669)',
              boxShadow: dark ? 'none' : '0 4px 16px rgba(16,185,129,0.25)',
            }}>
            <i className="fa-solid fa-plus text-[11px]" />
            Nouveau cours
          </motion.button>
        </div>
      </motion.div>

      {/* ══ STAT CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <i className={`fa-solid ${s.icon} text-[14px]`} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-[22px] font-bold tracking-tight leading-none mb-0.5"
                style={{ color: t.textPrimary }}>
                {s.value}
              </div>
              <div className="text-[11px]" style={{ color: t.textSub }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ══ TABLEAU ══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: t.surface,
          border: `1px solid ${t.border}`,
          boxShadow: t.shadow,
        }}>

        {/* ── Toolbar ── */}
        <div className="px-5 py-3.5 flex items-center gap-3 flex-wrap"
          style={{ borderBottom: `1px solid ${t.border}` }}>

          {/* Tabs actif/archivé */}
          <div className="flex rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: `1px solid ${t.border}` }}>
            {[{ key: 'ACTIVE', label: 'Actifs' }, { key: 'ARCHIVED', label: 'Archivés' }].map(v => (
              <button key={v.key}
                onClick={() => { setView(v.key); setFilterStatus('ALL'); setSearch(''); }}
                className="px-4 py-1.5 text-[12px] font-semibold transition"
                style={view === v.key ? {
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  color: 'white',
                } : {
                  color: t.textSub,
                  background: 'transparent',
                }}>
                {v.label}
              </button>
            ))}
          </div>

          {/* Filtres statut — uniquement en mode actif */}
          {view === 'ACTIVE' && (
            <div className="flex gap-1.5 flex-wrap">
              {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map(s => (
                <button key={s}
                  onClick={() => setFilterStatus(s)}
                  className="px-3 py-1 text-[11px] font-semibold rounded-lg transition"
                  style={filterStatus === s ? {
                    background: t.accentBg,
                    color: t.accentText,
                    border: `1px solid ${t.accentBorder}`,
                  } : {
                    color: t.textSub,
                    border: `1px solid ${t.border}`,
                    background: 'transparent',
                  }}>
                  {s === 'ALL' ? 'Tous' : statusConfig[s]?.label}
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="ml-auto flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
              background: t.surfaceSub,
              border: `1px solid ${t.border}`,
            }}>
            <i className="fa-solid fa-magnifying-glass text-[11px]" style={{ color: t.textSub }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="bg-transparent text-[13px] outline-none w-36"
              style={{ color: t.textPrimary }}
            />
          </div>
        </div>

        {/* ── En-tête colonnes ── */}
        <div className="grid px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
          style={{
            gridTemplateColumns: '1fr 120px 100px 80px 120px',
            color: t.textSub,
            borderBottom: `1px solid ${t.border}`,
            background: t.surfaceSub,
          }}>
          <span>Formation</span>
          <span className="text-center">Statut</span>
          <span className="text-center">Niveau</span>
          <span className="text-center">Note</span>
          <span className="text-center">Actions</span>
        </div>

        {/* ── Lignes ── */}
        {loading ? (
          <div className="p-10 flex justify-center">
            <motion.div animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-7 h-7 rounded-full"
              style={{ border: `2px solid ${t.accentBorder}`, borderTopColor: t.accent }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: t.accentBg }}>
              <i className="fa-solid fa-folder-open text-xl" style={{ color: t.accentText }} />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: t.textPrimary }}>
              {search ? 'Aucun résultat' : view === 'ARCHIVED' ? 'Aucun cours archivé' : 'Aucun cours créé'}
            </p>
            <p className="text-[12px] mb-5" style={{ color: t.textSub }}>
              {!search && view === 'ACTIVE' && 'Commencez par créer votre premier cours'}
            </p>
            {!search && view === 'ACTIVE' && (
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/instructor/create-course')}
                className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                Créer un cours
              </motion.button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.03 }}
                className="grid px-5 py-3.5 items-center cursor-pointer transition-colors"
                style={{
                  gridTemplateColumns: '1fr 120px 100px 80px 120px',
                  borderBottom: `1px solid ${t.border}`,
                }}
                onClick={() => navigate(`/instructor/courses/${course.id}/videos`)}
                onMouseEnter={e => e.currentTarget.style.background = t.rowHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                {/* Titre */}
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}>
                    <i className="fa-solid fa-book text-[11px]" style={{ color: t.accentText }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: t.textPrimary }}>
                      {course.title}
                    </p>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: t.textSub }}>
                      {course.description?.slice(0, 60)}…
                    </p>
                  </div>
                </div>

                {/* Statut */}
                <div className="flex justify-center">
                  <StatusBadge status={course.status} />
                </div>

                {/* Niveau */}
                <div className="flex justify-center">
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                    style={{
                      background: t.surfaceSub,
                      border: `1px solid ${t.border}`,
                      color: t.textSub,
                    }}>
                    {course.level}
                  </span>
                </div>

                {/* Note */}
                <div className="text-center">
                  {course.totalRatings > 0 ? (
                    <span className="text-[12px] font-bold flex items-center justify-center gap-1">
                      <i className="fa-solid fa-star text-[10px]" style={{ color: '#f59e0b' }} />
                      <span style={{ color: t.textPrimary }}>{course.averageRating}</span>
                    </span>
                  ) : (
                    <span style={{ color: t.textSub }}>—</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2"
                  onClick={e => e.stopPropagation()}>
                  {view === 'ACTIVE' ? (
                    <>
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/instructor/courses/${course.id}/videos`); }}
                        title="Vidéos"
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <i className="fa-solid fa-film text-[11px]" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/instructor/courses/${course.id}/quiz`); }}
                        title="Quiz"
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <i className="fa-solid fa-circle-question text-[11px]" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
                        onClick={(e) => handleArchive(course.id, e)}
                        title="Archiver"
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: t.surfaceSub, color: t.textSub, border: `1px solid ${t.border}` }}>
                        <i className="fa-solid fa-box-archive text-[11px]" />
                      </motion.button>
                    </>
                  ) : (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={(e) => handleRestore(course.id, e)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5"
                      style={{
                        background: t.accentBg,
                        border: `1px solid ${t.accentBorder}`,
                        color: t.accentText,
                      }}>
                      <i className="fa-solid fa-rotate-left text-[10px]" />
                      Restaurer
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Compteur */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-2.5 flex items-center justify-end"
            style={{ borderTop: `1px solid ${t.border}` }}>
            <p className="text-[11px]" style={{ color: t.textSub }}>
              {filtered.length} formation{filtered.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </motion.div>

    </InstructorLayout>
  );
};

export default InstructorDashboard;