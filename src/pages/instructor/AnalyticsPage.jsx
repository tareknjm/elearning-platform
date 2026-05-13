import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import api from '../../services/api';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);

  useEffect(() => {
    api.get('/instructor/analytics')
      .then(res => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cardStyle = {
    background: '#0d1a14',
    border: '1px solid rgba(16,185,129,0.15)',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
  };

  const statCards = [
    { label: 'Formations', value: analytics?.totalCourses ?? 0, icon: '📚', color: 'from-indigo-500 to-indigo-700' },
    { label: 'Apprenants', value: analytics?.totalStudents ?? 0, icon: '🎓', color: 'from-violet-500 to-violet-700' },
    { label: 'Note moyenne', value: analytics?.averageRating ? `${analytics.averageRating}★` : '—', icon: '⭐', color: 'from-amber-400 to-amber-600' },
    { label: 'Vidéos', value: analytics?.totalVideos ?? 0, icon: '🎬', color: 'from-emerald-400 to-emerald-600' },
  ];

  if (loading) return (
    <InstructorLayout>
      <div className="flex items-center justify-center py-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'rgba(16,185,129,0.5)', borderTopColor: 'transparent' }} />
      </div>
    </InstructorLayout>
  );

  return (
    <InstructorLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-emerald-400 text-sm mt-1">Performance de vos formations</p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03, y: -3 }}
            className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-white/75 text-sm mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Détail par formation */}
      <h2 className="text-lg font-semibold text-white mb-5">Détail par formation</h2>

      {!analytics?.courseStats || analytics.courseStats.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={cardStyle}>
          <div className="text-4xl mb-3">📭</div>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Aucune formation disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {analytics.courseStats.map((course, i) => (
            <motion.div
              key={course.courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="overflow-hidden"
              style={cardStyle}>

              {/* Header cliquable */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedCourse(
                  expandedCourse === course.courseId ? null : course.courseId
                )}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-2 h-2 rounded-full"
                        style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                      <h3 className="font-bold text-white text-lg">
                        {course.courseTitle}
                      </h3>
                    </div>
                    <p className="text-sm ml-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {course.enrollments} apprenant(s) inscrit(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {course.averageRating > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                        style={{
                          background: 'rgba(245,158,11,0.1)',
                          border: '1px solid rgba(245,158,11,0.2)',
                        }}>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="text-xs"
                              style={{ color: s <= Math.round(course.averageRating) ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-amber-400 font-bold text-sm">
                          {course.averageRating}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          ({course.totalRatings})
                        </span>
                      </div>
                    )}
                    <motion.span
                      animate={{ rotate: expandedCourse === course.courseId ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ color: 'rgba(16,185,129,0.6)', fontSize: '18px' }}>
                      ↓
                    </motion.span>
                  </div>
                </div>

                {/* Mini stats toujours visibles */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {[
                    { label: 'Inscrits', value: course.enrollments, color: '#818cf8' },
                    { label: 'Complétions', value: course.completions ?? 0, color: '#6ee7b7' },
                    {
                      label: 'Taux',
                      value: course.enrollments > 0
                        ? `${Math.round(((course.completions ?? 0) / course.enrollments) * 100)}%`
                        : '0%',
                      color: '#fcd34d'
                    },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl p-4 text-center"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                      <div className="text-xl font-bold mb-1" style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Barre de progression */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <span>Taux de complétion</span>
                    <span style={{ color: '#6ee7b7' }}>
                      {course.enrollments > 0
                        ? `${Math.round(((course.completions ?? 0) / course.enrollments) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: course.enrollments > 0
                          ? `${Math.round(((course.completions ?? 0) / course.enrollments) * 100)}%`
                          : '0%'
                      }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />
                  </div>
                </div>
              </div>

              {/* Section dépliable — vues par vidéo */}
              <AnimatePresence>
                {expandedCourse === course.courseId && course.videoStats?.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}>
                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-4"
                        style={{ color: 'rgba(16,185,129,0.6)', letterSpacing: '0.1em' }}>
                        Vues par vidéo
                      </p>
                      <div className="space-y-3">
                        {course.videoStats.map((video, j) => {
                          const maxViews = Math.max(
                            ...course.videoStats.map(v => Number(v.views) || 0), 1
                          );
                          const views = Number(video.views) || 0;
                          return (
                            <motion.div key={video.videoId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: j * 0.05 }}>
                              <div className="flex justify-between text-xs mb-1.5"
                                style={{ color: 'rgba(255,255,255,0.5)' }}>
                                <span className="truncate max-w-xs">
                                  {video.orderIndex}. {video.videoTitle}
                                </span>
                                <span className="ml-3 font-semibold flex-shrink-0"
                                  style={{ color: '#6ee7b7' }}>
                                  {views} vue{views > 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(views / maxViews) * 100}%` }}
                                  transition={{ duration: 0.8, delay: j * 0.08, ease: 'easeOut' }}
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