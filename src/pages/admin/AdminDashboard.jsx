import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getAllCourses } from '../../services/courseService';
import api from '../../services/api';
import AdminLayout from '../../components/layouts/AdminLayout';
import { motion } from 'framer-motion';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0, totalCourses: 0, pending: 0,
    instructors: 0, learners: 0, approved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersRes, courses] = await Promise.all([
          api.get('/admin/users'),
          getAllCourses()
        ]);
        const users = usersRes.data;
        setStats({
          totalUsers: users.length,
          totalCourses: courses.length,
          pending: courses.filter(c => c.status === 'PENDING').length,
          approved: courses.filter(c => c.status === 'APPROVED').length,
          instructors: users.filter(u => u.role === 'INSTRUCTOR').length,
          learners: users.filter(u => u.role === 'LEARNER').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: '👥', color: 'from-primary-500 to-primary-600' },
    { label: 'Formations', value: stats.totalCourses, icon: '📚', color: 'from-accent-500 to-accent-600' },
    { label: 'En attente', value: stats.pending, icon: '⏳', color: 'from-amber-400 to-amber-500' },
    { label: 'Approuvées', value: stats.approved, icon: '✅', color: 'from-emerald-400 to-emerald-500' },
    { label: 'Candidatures', value: stats.pending ?? 0, icon: '📋', color: 'from-violet-500 to-violet-700' },
  ];

  return (
  <AdminLayout>
    <div className="mb-8">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-white mb-1">
        Vue d'ensemble
      </motion.h1>
      <p className="text-indigo-400 text-sm">
        Plateforme E-Learning — Tableau de bord
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.03 }}
          className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 text-white`}>
          <div className="text-3xl mb-2">{card.icon}</div>
          <div className="text-3xl font-bold">{loading ? '...' : card.value}</div>
          <div className="text-white/80 text-sm mt-1">{card.label}</div>
        </motion.div>
      ))}
    </div>

    {/* Répartition */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
      {[
        { title: 'Répartition utilisateurs', items: [
          { label: 'Apprenants', value: stats.learners, color: '#6366f1', total: stats.totalUsers },
          { label: 'Instructeurs', value: stats.instructors, color: '#8b5cf6', total: stats.totalUsers },
        ]},
        { title: 'État des formations', items: [
          { label: 'Approuvées', value: stats.approved, color: '#10b981', total: stats.totalCourses },
          { label: 'En attente', value: stats.pending, color: '#f59e0b', total: stats.totalCourses },
        ]},
      ].map((section) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card p-5"
          style={{ background: '#0d0d1a', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '16px' }}>
          <h2 className="font-semibold text-white mb-4">{section.title}</h2>
          <div className="space-y-4">
            {section.items.map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-white">{item.value}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.total ? `${(item.value / item.total) * 100}%` : '0%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Actions */}
    <h2 className="font-semibold text-white mb-4">Actions rapides</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { label: 'Gérer les formations', sub: `${stats.pending} en attente`, icon: '📚', to: '/admin/courses' },
        { label: 'Gérer les utilisateurs', sub: `${stats.totalUsers} inscrits`, icon: '👥', to: '/admin/users' },
      ].map((action) => (
        <motion.button
          key={action.label}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(action.to)}
          className="text-left p-5 rounded-2xl flex items-center gap-4 transition"
          style={{
            background: '#0d0d1a',
            border: '1px solid rgba(99,102,241,0.12)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)'}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            {action.icon}
          </div>
          <div>
            <div className="font-semibold text-white">{action.label}</div>
            <div className="text-gray-500 text-sm mt-0.5">{action.sub}</div>
          </div>
          <span className="ml-auto text-indigo-400">→</span>
        </motion.button>
      ))}
    </div>
    <button onClick={() => navigate('/admin/applications')}
  className="card hover:shadow-md transition-all text-left group"
  style={{ background: '#0d0d1a', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '16px', padding: '20px' }}>
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
      style={{ background: 'rgba(139,92,246,0.1)' }}>
      📋
    </div>
    <div>
      <div className="font-semibold text-white">Candidatures instructeurs</div>
      <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
        {stats.pending ?? 0} candidature(s) en attente
      </div>
    </div>
    <span className="ml-auto" style={{ color: 'rgba(99,102,241,0.5)' }}>→</span>
  </div>
</button>
  </AdminLayout>
);
};

export default AdminDashboard;