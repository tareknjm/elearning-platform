import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { getAllCourses, approveCourse, rejectCourse } from '../../services/courseService';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getAllCourses().then(setCourses).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    await approveCourse(id);
    setCourses(courses.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c));
  };

  const handleReject = async (id) => {
    await rejectCourse(id);
    setCourses(courses.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c));
  };

  const filteredCourses = filter === 'ALL' ? courses : courses.filter(c => c.status === filter);

  const statusConfig = {
    APPROVED: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7', label: '✓ Approuvé' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5', label: '✗ Refusé' },
    PENDING: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d', label: '⏳ En attente' },
  };

  const filters = [
    { key: 'ALL', label: 'Toutes', count: courses.length },
    { key: 'PENDING', label: 'En attente', count: courses.filter(c => c.status === 'PENDING').length },
    { key: 'APPROVED', label: 'Approuvées', count: courses.filter(c => c.status === 'APPROVED').length },
    { key: 'REJECTED', label: 'Refusées', count: courses.filter(c => c.status === 'REJECTED').length },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Formations</h1>
        <p className="text-indigo-400 text-sm mt-1">{courses.length} formations au total</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <motion.button
            key={f.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2"
            style={filter === f.key ? {
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            } : {
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.15)',
              color: 'rgba(255,255,255,0.6)',
            }}>
            {f.label}
            <span className="px-1.5 py-0.5 rounded-full text-xs"
              style={{
                background: filter === f.key ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.2)',
                color: filter === f.key ? 'white' : '#a5b4fc',
              }}>
              {f.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl overflow-hidden p-6 space-y-3"
          style={{ background: '#0d0d1a', border: '1px solid rgba(99,102,241,0.12)' }}>
          {[1,2,3].map(i => (
            <div key={i} className="h-14 rounded-xl animate-pulse"
              style={{ background: 'rgba(99,102,241,0.05)' }}></div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: '#0d0d1a', border: '1px solid rgba(99,102,241,0.12)' }}>
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-400">Aucune formation dans cette catégorie</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#0d0d1a', border: '1px solid rgba(99,102,241,0.12)' }}>
          <table className="w-full">
            <thead style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <tr>
                {['Formation', 'Instructeur', 'Catégorie', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: '#6366f1' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCourses.map((course, i) => {
                  const sc = statusConfig[course.status] || statusConfig.PENDING;
                  return (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{course.title}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {course.level}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {course.instructorName}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {course.categoryName || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {course.status === 'PENDING' ? (
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleApprove(course.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{
                                background: 'rgba(16,185,129,0.15)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                color: '#6ee7b7',
                              }}>
                              Approuver
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleReject(course.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#fca5a5',
                              }}>
                              Refuser
                            </motion.button>
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      )}
    </AdminLayout>
  );
};

export default AdminCoursesPage;