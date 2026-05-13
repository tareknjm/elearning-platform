import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { getMyCourses } from '../../services/courseService';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const config = {
      APPROVED: { label: '✓ Approuvé', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
      REJECTED: { label: '✗ Refusé', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
      PENDING: { label: '⏳ En attente', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    };
    const s = config[status] || config.PENDING;
    return (
      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const stats = [
    { label: 'Total', value: courses.length, icon: '📚', color: 'from-emerald-400 to-emerald-600' },
    { label: 'Approuvées', value: courses.filter(c => c.status === 'APPROVED').length, icon: '✅', color: 'from-green-400 to-green-600' },
    { label: 'En attente', value: courses.filter(c => c.status === 'PENDING').length, icon: '⏳', color: 'from-amber-400 to-amber-600' },
  ];

  const cardStyle = {
    background: '#0d1a14',
    border: '1px solid rgba(16,185,129,0.15)',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
  };

  return (
    <InstructorLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Mes formations</h1>
          <p className="text-emerald-400 text-sm mt-1">Gérez et publiez vos cours</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-white/80 text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Formations */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl p-6 animate-pulse"
              style={cardStyle}>
              <div className="h-4 rounded mb-3 w-1/3"
                style={{ background: 'rgba(16,185,129,0.1)' }}></div>
              <div className="h-6 rounded mb-2"
                style={{ background: 'rgba(16,185,129,0.08)' }}></div>
              <div className="h-4 rounded w-2/3"
                style={{ background: 'rgba(16,185,129,0.06)' }}></div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-2xl"
          style={cardStyle}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl mb-4">📝</motion.div>
          <h3 className="font-semibold text-white mb-2">Aucune formation créée</h3>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Commencez par créer votre première formation
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/instructor/create-course')}
            className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
            }}>
            Créer une formation
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {courses.map((course) => (
              <motion.div
                key={course.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -6, borderColor: 'rgba(16,185,129,0.4)' }}
                className="flex flex-col p-6"
                style={cardStyle}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)'}>

                {/* Barre top émeraude */}
                <div className="h-0.5 rounded-full mb-5 -mt-1"
                  style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />

                <div className="flex justify-between items-start mb-4">
                  {statusBadge(course.status)}
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                    {course.level}
                  </span>
                </div>

                <h3 className="font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm line-clamp-2 flex-1 mb-5"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {course.description}
                </p>

                {/* Étoiles si notée */}
                {course.totalRatings > 0 && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-xs"
                          style={{ color: s <= Math.round(course.averageRating) ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>
                      {course.averageRating}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      ({course.totalRatings})
                    </span>
                  </div>
                )}

                <div className="pt-4 flex gap-2"
                  style={{ borderTop: '1px solid rgba(16,185,129,0.08)' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/instructor/courses/${course.id}/videos`)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition"
                    style={{
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      color: '#6ee7b7',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.2)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                    }}>
                    🎬 Vidéos
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(`/instructor/courses/${course.id}/quiz`)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition"
                    style={{
                      background: 'rgba(245,158,11,0.1)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      color: '#fcd34d',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(245,158,11,0.2)';
                      e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)';
                    }}>
                    📝 Quiz
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </InstructorLayout>
  );
};

export default InstructorDashboard;