import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const Icons = {
  courses: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="white" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  students: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="white" strokeWidth="1.8"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  rating: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="white" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  videos: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="white" strokeWidth="1.8"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  empty: <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
};

const AnalyticsPage = () => {
  const { dark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);

  const t = {
    textPrimary:  dark ? '#ffffff'                : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.45)' : '#6b7280',
    surface:      dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    surfaceSub:   dark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
    border:       dark ? 'rgba(255,255,255,0.08)' : '#ebebeb',
    shadow:       dark ? 'none'                   : '0 1px 12px rgba(0,0,0,0.05)',
    accent:       '#10b981',
    accentText:   dark ? '#6ee7b7'                : '#059669',
    accentBorder: dark ? 'rgba(16,185,129,0.2)'   : 'rgba(16,185,129,0.15)',
    barBg:        dark ? 'rgba(255,255,255,0.06)'  : '#e5e7eb',
    innerBg:      dark ? 'rgba(255,255,255,0.03)'  : '#f8f9fa',
  };

  useEffect(() => {
    api.get('/instructor/analytics')
      .then(res => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Formations',   value: analytics?.totalCourses ?? 0,       icon: Icons.courses,  gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', shadow: 'rgba(99,102,241,0.25)'  },
    { label: 'Apprenants',   value: analytics?.totalStudents ?? 0,       icon: Icons.students, gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', shadow: 'rgba(139,92,246,0.25)' },
    { label: 'Note moyenne', value: analytics?.averageRating ? `${analytics.averageRating}★` : '—', icon: Icons.rating, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', shadow: 'rgba(245,158,11,0.25)' },
    { label: 'Vidéos',       value: analytics?.totalVideos ?? 0,         icon: Icons.videos,   gradient: 'linear-gradient(135deg,#10b981,#059669)', shadow: 'rgba(16,185,129,0.25)'  },
  ];

  if (loading) return (
    <InstructorLayout>
      <div className="flex items-center justify-center py-32">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full"
          style={{ border: `2px solid ${t.accentBorder}`, borderTopColor: t.accent }} />
      </div>
    </InstructorLayout>
  );

  return (
    <InstructorLayout>

      {/* Hero */}
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: t.accentText }}>
          Espace instructeur
        </p>
        <h1 className="text-[2rem] font-bold tracking-tight" style={{ color: t.textPrimary, letterSpacing: '-0.025em' }}>
          Analytics
        </h1>
        <p className="text-[13px] mt-1" style={{ color: t.textSub }}>Performance de vos formations</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: card.gradient, boxShadow: `0 6px 20px ${card.shadow}` }}>
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="relative z-10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                {card.icon}
              </div>
              <div className="text-[26px] font-bold leading-none mb-0.5">{card.value}</div>
              <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.8)' }}>{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Détail par formation */}
      <h2 className="text-[15px] font-semibold mb-4" style={{ color: t.textPrimary }}>Détail par formation</h2>

      {!analytics?.courseStats || analytics.courseStats.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>
          <div className="flex justify-center mb-3" style={{ color: t.textSub, opacity: 0.5 }}>{Icons.empty}</div>
          <p className="text-[13px]" style={{ color: t.textSub }}>Aucune formation disponible</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analytics.courseStats.map((course, i) => (
            <motion.div key={course.courseId}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="overflow-hidden rounded-2xl"
              style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>

              {/* Header cliquable */}
              <div className="p-5 cursor-pointer"
                onClick={() => setExpandedCourse(expandedCourse === course.courseId ? null : course.courseId)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: '#10b981', boxShadow: dark ? '0 0 6px #10b981' : 'none' }} />
                      <h3 className="font-semibold text-[14px] truncate" style={{ color: t.textPrimary }}>
                        {course.courseTitle}
                      </h3>
                    </div>
                    <p className="text-[12px] ml-4.5" style={{ color: t.textSub }}>
                      {course.enrollments} apprenant(s) inscrit(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {course.averageRating > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
                        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="text-[11px]"
                              style={{ color: s <= Math.round(course.averageRating) ? '#f59e0b' : t.barBg }}>★</span>
                          ))}
                        </div>
                        <span className="font-bold text-[12px]" style={{ color: '#f59e0b' }}>{course.averageRating}</span>
                        <span className="text-[11px]" style={{ color: t.textSub }}>({course.totalRatings})</span>
                      </div>
                    )}
                    <motion.svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"
                      stroke={t.accentText} strokeWidth="2.5"
                      animate={{ rotate: expandedCourse === course.courseId ? 180 : 0 }}
                      transition={{ duration: 0.3 }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </motion.svg>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Inscrits',     value: course.enrollments,                                 color: dark ? '#818cf8' : '#4f46e5' },
                    { label: 'Complétions',  value: course.completions ?? 0,                            color: t.accentText },
                    { label: 'Taux',         value: course.enrollments > 0 ? `${Math.round(((course.completions ?? 0) / course.enrollments) * 100)}%` : '0%', color: dark ? '#fcd34d' : '#b45309' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl p-3 text-center"
                      style={{ background: t.innerBg, border: `1px solid ${t.border}` }}>
                      <div className="text-[20px] font-bold mb-0.5" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-[11px]" style={{ color: t.textSub }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Barre progression */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: t.textSub }}>
                    <span>Taux de complétion</span>
                    <span style={{ color: t.accentText }}>
                      {course.enrollments > 0 ? `${Math.round(((course.completions ?? 0) / course.enrollments) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.barBg }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: course.enrollments > 0 ? `${Math.round(((course.completions ?? 0) / course.enrollments) * 100)}%` : '0%' }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />
                  </div>
                </div>
              </div>

              {/* Vues par vidéo — dépliable */}
              <AnimatePresence>
                {expandedCourse === course.courseId && course.videoStats?.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    style={{ borderTop: `1px solid ${t.border}` }}>
                    <div className="p-5">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: t.accentText }}>
                        Vues par vidéo
                      </p>
                      <div className="space-y-3">
                        {course.videoStats.map((video, j) => {
                          const maxViews = Math.max(...course.videoStats.map(v => Number(v.views) || 0), 1);
                          const views = Number(video.views) || 0;
                          return (
                            <motion.div key={video.videoId}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: j * 0.04 }}>
                              <div className="flex justify-between text-[11px] mb-1.5" style={{ color: t.textSub }}>
                                <span className="truncate max-w-xs">{video.orderIndex}. {video.videoTitle}</span>
                                <span className="ml-3 font-semibold flex-shrink-0" style={{ color: t.accentText }}>
                                  {views} vue{views > 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.barBg }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(views / maxViews) * 100}%` }}
                                  transition={{ duration: 0.7, delay: j * 0.07 }}
                                  className="h-full rounded-full"
                                  style={{ background: 'linear-gradient(to right, #10b981, #6ee7b7)' }} />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </InstructorLayout>
  );
};

export default AnalyticsPage;