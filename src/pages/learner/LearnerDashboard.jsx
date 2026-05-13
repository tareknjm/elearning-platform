import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import { getMyEnrollments } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
const LearnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments()
      .then(setEnrollments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <LearnerLayout>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative rounded-3xl overflow-hidden mb-8 p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.2) 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          backdropFilter: 'blur(20px)',
        }}>

        {/* Décoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          }} />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-violet-300 text-sm font-medium mb-2">
              ✨ Bienvenue sur votre espace
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-extrabold text-white mb-2">
              Bonjour, {user?.name?.split(' ')[0]} 👋
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400">
              {enrollments.length > 0
                ? `Vous avez ${enrollments.length} formation(s) en cours. Continuez ! 🚀`
                : 'Commencez votre parcours d\'apprentissage dès aujourd\'hui !'}
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/courses')}
            className="px-6 py-3 rounded-2xl font-semibold text-white flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '0 0 30px rgba(139,92,246,0.4)',
            }}>
            <span>Explorer les formations</span>
            <span>→</span>
          </motion.button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Formations', value: enrollments.length, icon: '📚' },
            { label: 'En cours', value: enrollments.length, icon: '⚡' },
            { label: 'Certificats', value: 0, icon: '🏆' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl p-4 text-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Mes formations */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Mes formations</h2>
        <button onClick={() => navigate('/courses')}
          className="text-violet-400 text-sm hover:text-violet-300 transition">
          + Explorer d'autres
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl p-6 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-4 bg-white/10 rounded mb-3 w-1/3"></div>
              <div className="h-6 bg-white/10 rounded mb-2"></div>
              <div className="h-8 bg-white/10 rounded mt-4"></div>
            </div>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4">🎓</motion.div>
          <p className="text-white font-semibold text-lg mb-2">Aucune formation en cours</p>
          <p className="text-gray-400 text-sm mb-6">
            Explorez notre catalogue et commencez à apprendre
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/courses')}
            className="px-8 py-3 rounded-2xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
            Explorer les formations
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {enrollments.map((enrollment, i) => (
              <motion.div
                key={enrollment.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-6 flex flex-col cursor-pointer"
                onClick={() => navigate(`/learner/courses/${enrollment.courseId}/watch`)}>

                {/* Header carte */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      background: 'rgba(139,92,246,0.2)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      color: '#c4b5fd',
                    }}>
                    {enrollment.categoryName || 'Général'}
                  </span>
                  <span className="text-2xl">
                    {i % 3 === 0 ? '🔥' : i % 3 === 1 ? '⚡' : '🌟'}
                  </span>
                </div>

                <h3 className="font-bold text-white mb-1 line-clamp-2">
                  {enrollment.courseTitle}
                </h3>
                <p className="text-gray-400 text-xs mb-4">
                  Par {enrollment.instructorName}
                </p>

                {/* Barre de progression fictive */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progression</span>
                    <span>En cours</span>
                  </div>
                  <div className="h-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${30 + (i * 20) % 60}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #8b5cf6, #6366f1)' }}>
                    </motion.div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-auto w-full py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
                  }}>
                  Continuer →
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </LearnerLayout>
  );
};

export default LearnerDashboard;