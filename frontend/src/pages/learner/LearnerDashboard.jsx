import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import { useTheme } from '../../context/ThemeContext';
import { getMyEnrollments } from '../../services/enrollmentService';
import { getCourseProgress, getResumeProgress } from '../../services/progressService';
import { hasPassed, downloadCertificate } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { resolveMediaUrl } from '../../utils/media';
import { getApprovedCourses } from '../../services/courseService';
import { getWeeklyGoal, updateWeeklyGoal } from '../../services/weeklyGoalService';
import VideoCallBookingModal from '../../components/modals/VideoCallBookingModal';

const MiniRing = ({ percent, size = 44, accent, dark }) => {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const done = percent === 100;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={dark ? 'rgba(255,255,255,0.1)' : '#ebebeb'} strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={done ? '#10b981' : accent} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
        style={{ color: done ? '#10b981' : (dark ? '#fff' : '#111827') }}>
        {percent}%
      </span>
    </div>
  );
};

const LearnerDashboard = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [certCount, setCertCount] = useState(0);
  const [certCourses, setCertCourses] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState({ targetLessons: 5, completedLessons: 0 });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(5);
  const [downloadingCert, setDownloadingCert] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [resumeDismissed, setResumeDismissed] = useState(false);

  // ── Tokens thème cohérents
  const t = {
    bg:          dark ? 'transparent'                   : 'transparent',
    surface:     dark ? 'rgba(255,255,255,0.04)'        : '#ffffff',
    surfaceSub:  dark ? 'rgba(255,255,255,0.02)'        : '#f8f9fa',
    border:      dark ? 'rgba(255,255,255,0.08)'        : '#ebebeb',
    shadow:      dark ? 'none'                          : '0 1px 12px rgba(0,0,0,0.05)',
    shadowMd:    dark ? 'none'                          : '0 2px 20px rgba(0,0,0,0.07)',
    textPrimary: dark ? '#ffffff'                       : '#111827',
    textSub:     dark ? 'rgba(255,255,255,0.5)'         : '#6b7280',
    accent:      '#8b5cf6',
    accentBg:    dark ? 'rgba(139,92,246,0.12)'         : 'rgba(139,92,246,0.07)',
    accentBorder:dark ? 'rgba(139,92,246,0.25)'         : 'rgba(139,92,246,0.15)',
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const data = await getMyEnrollments();
      setEnrollments(data);
      getResumeProgress().then(setResume).catch(() => setResume(null));
      getWeeklyGoal().then(setWeeklyGoal).catch(() => {});

      getApprovedCourses().then((allCourses) => {
        const enrolledIds = new Set(data.map(e => e.courseId));
        const followedCatIds = new Set(
          allCourses.filter(c => enrolledIds.has(c.id)).map(c => c.categoryId)
        );
        let pool = allCourses.filter(c => !enrolledIds.has(c.id) && followedCatIds.has(c.categoryId));
        if (pool.length === 0)
          pool = allCourses.filter(c => !enrolledIds.has(c.id)).sort((a, b) => b.averageRating - a.averageRating);
        setRecommendations(pool.slice(0, 8));
      }).catch(() => setRecommendations([]));

      const results = await Promise.all(
        data.map(async (e) => {
          try {
            const [progress, passed] = await Promise.all([getCourseProgress(e.courseId), hasPassed(e.courseId)]);
            return { courseId: e.courseId, percent: progress?.progressPercent || 0, passed };
          } catch { return { courseId: e.courseId, percent: 0, passed: false }; }
        })
      );

      const map = {};
      let certs = 0;
      const certList = [];
      results.forEach((r, i) => {
        map[r.courseId] = r;
        if (r.passed) {
          certs++;
          certList.push({
            courseId: r.courseId,
            courseTitle: data[i]?.courseTitle || 'Formation',
            categoryName: data[i]?.categoryName || '',
            courseImageUrl: data[i]?.courseImageUrl || null,
          });
        }
      });
      setProgressMap(map);
      setCertCount(certs);
      setCertCourses(certList);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDownloadCert = async (courseId, e) => {
    e.stopPropagation();
    setDownloadingCert(courseId);
    try { await downloadCertificate(courseId); } catch {}
    finally { setDownloadingCert(null); }
  };

  const inProgressCount = enrollments.filter(e => {
    const p = progressMap[e.courseId]?.percent || 0;
    return p > 0 && p < 100;
  }).length;

  const goToResume = () => {
    if (!resume) return;
    navigate(resume.quizReady
      ? `/learner/courses/${resume.courseId}/quiz`
      : `/learner/courses/${resume.courseId}/watch?video=${resume.videoId}`
    );
  };

  const showResumeFloating = resume && !resume.quizPassed && !resumeDismissed;

  const pctGoal = Math.min(weeklyGoal.completedLessons / weeklyGoal.targetLessons, 1);
  const r = 30, circ = 2 * Math.PI * r;

  return (
    <LearnerLayout>
      <div className="max-w-[1360px] mx-auto px-1">

        {/* ══ HERO ══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 pt-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-2.5"
            style={{ color: t.accent }}>
            Votre espace d'apprentissage
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-[2.4rem] font-bold tracking-tight leading-none mb-2"
                style={{ color: t.textPrimary, letterSpacing: '-0.025em' }}>
                Bonjour, {user?.name?.split(' ')[0]}.
              </h1>
              <p className="text-[15px]" style={{ color: t.textSub }}>
                {enrollments.length > 0
                  ? `${inProgressCount} formation${inProgressCount > 1 ? 's' : ''} en cours · continuez votre progression`
                  : "Commencez votre parcours d'apprentissage dès aujourd'hui"}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/courses')}
              className="px-5 py-2.5 rounded-full font-semibold text-[13px] flex items-center gap-2 flex-shrink-0"
              style={{
                background: dark ? '#ffffff' : '#111827',
                color: dark ? '#111827' : '#ffffff',
              }}>
              <i className="fa-solid fa-compass text-[11px]" />
              Explorer les formations
            </motion.button>
          </div>
        </motion.div>

        {/* ══ LAYOUT ══ */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ─── COLONNE PRINCIPALE ─── */}
          <div className="flex-1 min-w-0 w-full space-y-8">

            {/* Recommandations */}
            {recommendations.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-semibold" style={{ color: t.textPrimary }}>
                    Recommandé pour vous
                  </h2>
                  <span className="text-[12px] flex items-center gap-1" style={{ color: t.textSub }}>
                    Faites glisser <i className="fa-solid fa-arrow-right text-[10px]" />
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
                  style={{ scrollbarWidth: 'none' }}>
                  {recommendations.map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="snap-start flex-shrink-0 w-[200px] rounded-2xl overflow-hidden cursor-pointer"
                      style={{
                        background: t.surface,
                        border: `1px solid ${t.border}`,
                        boxShadow: t.shadow,
                      }}>
                      <div className="h-[100px] overflow-hidden">
                        <img
                          src={resolveMediaUrl(course.imageUrl)}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                          style={{ color: t.accent }}>
                          {course.categoryName}
                        </p>
                        <h3 className="text-[12px] font-semibold leading-snug line-clamp-2"
                          style={{ color: t.textPrimary }}>
                          {course.title}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Mes formations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] font-bold tracking-tight"
                  style={{ color: t.textPrimary, letterSpacing: '-0.015em' }}>
                  Mes formations
                </h2>
                {enrollments.length > 0 && (
                  <button onClick={() => navigate('/courses')}
                    className="text-[13px] font-medium flex items-center gap-1.5 transition-opacity hover:opacity-60"
                    style={{ color: t.accent }}>
                    Explorer d'autres <i className="fa-solid fa-arrow-right text-[10px]" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="rounded-2xl animate-pulse h-[220px]"
                      style={{ background: t.surface, border: `1px solid ${t.border}` }} />
                  ))}
                </div>
              ) : enrollments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-20 rounded-2xl"
                  style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: t.accentBg }}>
                    <i className="fa-solid fa-graduation-cap text-xl" style={{ color: t.accent }} />
                  </div>
                  <p className="font-semibold text-[15px] mb-1" style={{ color: t.textPrimary }}>
                    Aucune formation en cours
                  </p>
                  <p className="text-[13px] mb-6" style={{ color: t.textSub }}>
                    Explorez notre catalogue et commencez à apprendre
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/courses')}
                    className="px-6 py-2.5 rounded-full text-[13px] font-semibold"
                    style={{ background: dark ? '#fff' : '#111827', color: dark ? '#111827' : '#fff' }}>
                    Explorer les formations
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden" animate="visible"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {enrollments.map((enrollment) => {
                    const prog = progressMap[enrollment.courseId] || { percent: 0, passed: false };
                    const isDone = prog.percent === 100;
                    return (
                      <motion.div
                        key={enrollment.id}
                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
                        whileHover={{ y: -4 }}
                        onClick={() => navigate(`/learner/courses/${enrollment.courseId}/watch`)}
                        className="rounded-2xl overflow-hidden cursor-pointer flex flex-col"
                        style={{
                          background: t.surface,
                          border: `1px solid ${t.border}`,
                          boxShadow: t.shadow,
                        }}>
                        {/* Image */}
                        <div className="relative h-[120px] overflow-hidden flex-shrink-0">
                          {enrollment.courseImageUrl ? (
                            <img src={resolveMediaUrl(enrollment.courseImageUrl)} alt={enrollment.courseTitle}
                              className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full"
                              style={{ background: `linear-gradient(135deg,${t.accent},#6366f1)` }} />
                          )}
                          <div className="absolute inset-0"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent 55%)' }} />
                          <span className="absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: 'rgba(255,255,255,0.92)', color: t.accent }}>
                            {enrollment.categoryName || 'Général'}
                          </span>
                          {isDone && (
                            <span className="absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded-full font-bold text-white flex items-center gap-1"
                              style={{ background: 'rgba(16,185,129,0.9)' }}>
                              <i className="fa-solid fa-check text-[8px]" /> Terminé
                            </span>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="font-semibold text-[14px] mb-1 line-clamp-1"
                            style={{ color: t.textPrimary }}>
                            {enrollment.courseTitle}
                          </h3>
                          <p className="text-[11px] mb-3 flex items-center gap-1.5" style={{ color: t.textSub }}>
                            <i className="fa-solid fa-user text-[9px]" />
                            Par {enrollment.instructorName}
                          </p>

                          {/* Barre progression + anneau */}
                          <div className="flex items-center gap-3 mt-auto pt-3"
                            style={{ borderTop: `1px solid ${t.border}` }}>
                            <MiniRing percent={prog.percent} accent={t.accent} dark={dark} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold" style={{ color: t.textPrimary }}>
                                {isDone ? (prog.passed ? 'Quiz réussi' : 'Quiz à passer') : 'En progression'}
                              </p>
                              <p className="text-[11px]" style={{ color: t.textSub }}>
                                {isDone
                                  ? (prog.passed ? 'Certificat disponible' : 'Vidéos terminées')
                                  : 'Continuez votre apprentissage'}
                              </p>
                            </div>
                            <i className="fa-solid fa-chevron-right text-[11px]" style={{ color: t.textSub }} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </section>
          </div>

          {/* ─── SIDEBAR ─── */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[272px] flex-shrink-0 lg:sticky lg:top-6 space-y-4">

            {/* ── Bloc stats + objectif + appel groupés ── */}
            <div className="rounded-2xl overflow-hidden"
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                boxShadow: t.shadow,
              }}>

              {/* Stats */}
              <div className="px-4 pt-4 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: t.textSub }}>
                  Vue d'ensemble
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Formations', value: enrollments.length, icon: 'fa-book-open' },
                    { label: 'En cours', value: inProgressCount, icon: 'fa-bolt' },
                    { label: 'Certificats', value: certCount, icon: 'fa-certificate' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: t.accentBg }}>
                        <i className={`fa-solid ${s.icon} text-[12px]`} style={{ color: t.accent }} />
                      </div>
                      <span className="flex-1 text-[13px]" style={{ color: t.textSub }}>{s.label}</span>
                      <span className="text-[18px] font-bold tracking-tight"
                        style={{ color: t.textPrimary }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: t.border }} />

              {/* Objectif hebdo — compact */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold flex items-center gap-1.5"
                    style={{ color: t.textPrimary }}>
                    <i className="fa-solid fa-bullseye text-[11px]" style={{ color: t.accent }} />
                    Objectif semaine
                  </span>
                  <button
                    onClick={() => { setEditingGoal(true); setGoalInput(weeklyGoal.targetLessons); }}
                    className="text-[10px] px-2 py-0.5 rounded-lg"
                    style={{ background: t.accentBg, color: t.accent }}>
                    Modifier
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
                    <circle cx="36" cy="36" r={r} fill="none"
                      stroke={dark ? 'rgba(255,255,255,0.08)' : '#ebebeb'} strokeWidth="6" />
                    <motion.circle cx="36" cy="36" r={r} fill="none"
                      stroke={t.accent} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: circ - pctGoal * circ }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{ transformOrigin: '36px 36px', transform: 'rotate(-90deg)' }} />
                    <text x="36" y="41" textAnchor="middle" fontSize="12" fontWeight="700"
                      fill={t.textPrimary}>
                      {weeklyGoal.completedLessons}/{weeklyGoal.targetLessons}
                    </text>
                  </svg>
                  <div>
                    <p className="text-[11px]" style={{ color: t.textSub }}>leçons cette semaine</p>
                    <p className="text-[12px] font-bold mt-1"
                      style={{ color: pctGoal >= 1 ? '#10b981' : t.accent }}>
                      {pctGoal >= 1
                        ? 'Objectif atteint !'
                        : `${Math.round(pctGoal * 100)}% accompli`}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {editingGoal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 overflow-hidden flex gap-2">
                      <input type="number" min="1" max="50" value={goalInput}
                        onChange={e => setGoalInput(Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded-lg text-[13px] text-center outline-none"
                        style={{
                          background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                          color: t.textPrimary,
                          border: `1px solid ${t.accentBorder}`,
                        }} />
                      <button
                        onClick={async () => {
                          const updated = await updateWeeklyGoal(goalInput);
                          setWeeklyGoal(updated);
                          setEditingGoal(false);
                        }}
                        className="flex-1 py-1 rounded-lg text-[12px] font-semibold text-white"
                        style={{ background: t.accent }}>
                        Valider
                      </button>
                      <button
                        onClick={() => setEditingGoal(false)}
                        className="px-2 py-1 rounded-lg text-[12px]"
                        style={{ color: t.textSub, background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}>
                        ✕
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: t.border }} />

              {/* Réserver un appel */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = t.surfaceSub}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: t.accentBg }}>
                  <i className="fa-solid fa-video text-[12px]" style={{ color: t.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>
                    Réserver un appel 1-on-1
                  </p>
                  <p className="text-[11px]" style={{ color: t.textSub }}>Session privée avec un instructeur</p>
                </div>
                <i className="fa-solid fa-chevron-right text-[10px]" style={{ color: t.textSub }} />
              </button>
            </div>

            {/* ── Certificats ── */}
            {certCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl p-4"
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.shadow,
                }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                    style={{ color: t.textSub }}>
                    <i className="fa-solid fa-trophy text-[10px]" style={{ color: '#f59e0b' }} />
                    Mes certificats
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: t.accentBg, color: t.accent }}>
                    {certCount}
                  </span>
                </div>
                <div className="space-y-2">
                  {certCourses.map((cert, i) => (
                    <motion.div
                      key={cert.courseId}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex items-center gap-3 p-2 rounded-xl"
                      style={{
                        background: t.surfaceSub,
                        border: `1px solid ${t.border}`,
                      }}>
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {cert.courseImageUrl ? (
                          <img src={resolveMediaUrl(cert.courseImageUrl)} alt={cert.courseTitle}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg,${t.accent},#6366f1)` }}>
                            <i className="fa-solid fa-certificate text-white text-[12px]" />
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                          style={{ background: '#f59e0b', border: `1.5px solid ${dark ? '#18181b' : '#fff'}` }}>
                          <i className="fa-solid fa-star text-white" style={{ fontSize: '5px' }} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold line-clamp-1" style={{ color: t.textPrimary }}>
                          {cert.courseTitle}
                        </p>
                        {cert.categoryName && (
                          <p className="text-[10px]" style={{ color: t.textSub }}>{cert.categoryName}</p>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                        onClick={(e) => handleDownloadCert(cert.courseId, e)}
                        disabled={downloadingCert === cert.courseId}
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                        style={{ background: t.accentBg, color: t.accent }}>
                        <i className={`fa-solid ${downloadingCert === cert.courseId ? 'fa-spinner fa-spin' : 'fa-download'} text-[11px]`} />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.aside>
        </div>
      </div>

      {/* ══ FLOATING REPRENDRE ══ */}
      <AnimatePresence>
        {showResumeFloating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="fixed bottom-5 right-5 z-40 w-[340px] rounded-2xl overflow-hidden cursor-pointer"
            style={{
              background: dark ? 'rgba(18,18,24,0.92)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid ${t.border}`,
              boxShadow: dark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.12)',
            }}
            onClick={goToResume}>
            <div className="flex items-center gap-3 p-3">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                {resume.courseImageUrl ? (
                  <img src={resolveMediaUrl(resume.courseImageUrl)} alt={resume.courseTitle}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full"
                    style={{ background: `linear-gradient(135deg,${t.accent},#6366f1)` }} />
                )}
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.22)' }}>
                  <i className="fa-solid fa-play text-white text-[13px] ml-0.5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: t.accent }}>
                  {resume.quizReady ? 'Quiz à passer' : 'Reprendre'}
                </p>
                <p className="text-[13px] font-semibold line-clamp-1" style={{ color: t.textPrimary }}>
                  {resume.courseTitle}
                </p>
                <p className="text-[11px] line-clamp-1" style={{ color: t.textSub }}>
                  {resume.quizReady ? 'Validez vos connaissances' : resume.videoTitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setResumeDismissed(true); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ color: t.textSub, background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }}>
                  <i className="fa-solid fa-xmark text-[11px]" />
                </button>
                <MiniRing percent={resume.progressPercent} size={36} accent={t.accent} dark={dark} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoCallBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </LearnerLayout>
  );
};

export default LearnerDashboard;