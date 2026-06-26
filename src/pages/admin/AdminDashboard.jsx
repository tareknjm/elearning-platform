import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { getAllCourses } from '../../services/courseService';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0, totalCourses: 0, pending: 0,
    instructors: 0, learners: 0, approved: 0, applications: 0,
  });
  const [loading, setLoading] = useState(true);

  // ── Tokens cohérents
  const t = {
    textPrimary:  dark ? '#ffffff'                : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.5)'  : '#6b7280',
    surface:      dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    surfaceSub:   dark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
    border:       dark ? 'rgba(255,255,255,0.08)' : '#ebebeb',
    shadow:       dark ? 'none'                   : '0 1px 12px rgba(0,0,0,0.05)',
    accent:       '#6366f1',
    accentBg:     dark ? 'rgba(99,102,241,0.12)'  : 'rgba(99,102,241,0.07)',
    accentBorder: dark ? 'rgba(99,102,241,0.25)'  : 'rgba(99,102,241,0.15)',
    accentText:   dark ? '#a5b4fc'                : '#4f46e5',
    barBg:        dark ? 'rgba(255,255,255,0.06)' : '#f0f0f0',
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, courses] = await Promise.all([
          api.get('/admin/users'),
          getAllCourses(),
        ]);
        const users = usersRes.data;
        setStats({
          totalUsers:   users.length,
          totalCourses: courses.length,
          pending:      courses.filter(c => c.status === 'PENDING').length,
          approved:     courses.filter(c => c.status === 'APPROVED').length,
          instructors:  users.filter(u => u.role === 'INSTRUCTOR').length,
          learners:     users.filter(u => u.role === 'LEARNER').length,
          applications: 0,
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = [
    {
      label: 'Utilisateurs', value: stats.totalUsers,
      icon: 'fa-users', color: '#6366f1',
      bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)',
      sub: `${stats.learners} apprenants · ${stats.instructors} instructeurs`,
      to: '/admin/users',
    },
    {
      label: 'Formations', value: stats.totalCourses,
      icon: 'fa-book-open', color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.15)',
      sub: `${stats.approved} approuvées`,
      to: '/admin/courses',
    },
    {
      label: 'En attente', value: stats.pending,
      icon: 'fa-clock', color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)',
      sub: 'Formations à valider',
      to: '/admin/courses',
    },
    {
      label: 'Candidatures', value: stats.applications,
      icon: 'fa-file-lines', color: '#10b981',
      bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)',
      sub: 'Instructeurs en attente',
      to: '/admin/applications',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <AdminLayout>

      {/* ══ HERO ══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
          style={{ color: t.accentText }}>
          Administration
        </p>
        <h1 className="text-[2.2rem] font-bold tracking-tight leading-none mb-2"
          style={{ color: t.textPrimary, letterSpacing: '-0.025em' }}>
          {greeting}.
        </h1>
        <p className="text-[14px]" style={{ color: t.textSub }}>
          {stats.totalUsers} utilisateurs · {stats.totalCourses} formations · {stats.pending > 0
            ? <span style={{ color: '#f59e0b' }}>{stats.pending} en attente de validation</span>
            : 'tout est à jour'}
        </p>
      </motion.div>

      {/* ══ STAT CARDS — style métrique léger ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -3 }}
            onClick={() => navigate(s.to)}
            className="rounded-2xl p-5 cursor-pointer"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = s.border}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>

            {/* Icône */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <i className={`fa-solid ${s.icon} text-[14px]`} style={{ color: s.color }} />
            </div>

            {/* Valeur */}
            <div className="text-[32px] font-bold tracking-tight leading-none mb-1"
              style={{ color: loading ? t.textSub : s.color }}>
              {loading ? '—' : s.value}
            </div>

            {/* Label */}
            <div className="text-[13px] font-semibold mb-1" style={{ color: t.textPrimary }}>
              {s.label}
            </div>

            {/* Sous-texte */}
            <div className="text-[11px]" style={{ color: t.textSub }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ══ RÉPARTITION + ÉTAT — compacts côte à côte ══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Répartition utilisateurs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="rounded-2xl p-5"
          style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>
              Répartition utilisateurs
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: t.accentBg, color: t.accentText }}>
              {stats.totalUsers}
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Apprenants',    value: stats.learners,     color: '#6366f1', total: stats.totalUsers },
              { label: 'Instructeurs',  value: stats.instructors,  color: '#8b5cf6', total: stats.totalUsers },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span style={{ color: t.textSub }}>{item.label}</span>
                  <span className="font-semibold" style={{ color: t.textPrimary }}>{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.barBg }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.total ? `${(item.value / item.total) * 100}%` : '0%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                    className="h-full rounded-full"
                    style={{ background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* État formations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="rounded-2xl p-5"
          style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>
              État des formations
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)' }}>
              {stats.totalCourses}
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Approuvées', value: stats.approved, color: '#10b981', total: stats.totalCourses },
              { label: 'En attente', value: stats.pending,  color: '#f59e0b', total: stats.totalCourses },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span style={{ color: t.textSub }}>{item.label}</span>
                  <span className="font-semibold" style={{ color: t.textPrimary }}>{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.barBg }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: item.total ? `${(item.value / item.total) * 100}%` : '0%' }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.45 }}
                    className="h-full rounded-full"
                    style={{ background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ══ ACCÈS RAPIDES — liste compacte ══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadow }}>

        <div className="px-5 py-3.5"
          style={{ borderBottom: `1px solid ${t.border}`, background: t.surfaceSub }}>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: t.textSub }}>
            Accès rapides
          </p>
        </div>

        {[
          { label: 'Gérer les formations',        sub: `${stats.pending} en attente de validation`,  icon: 'fa-book-open',   color: '#8b5cf6', to: '/admin/courses'        },
          { label: 'Gérer les utilisateurs',       sub: `${stats.totalUsers} comptes inscrits`,        icon: 'fa-users',       color: '#6366f1', to: '/admin/users'          },
          { label: 'Candidatures instructeurs',    sub: `${stats.applications} en attente`,            icon: 'fa-file-lines',  color: '#10b981', to: '/admin/applications'   },
          { label: 'Justificatifs d\'absence',     sub: 'Examiner les certificats médicaux',           icon: 'fa-file-medical',color: '#f59e0b', to: '/admin/absences'       },
          { label: 'Demandes de catégories',       sub: 'Approuver les nouvelles catégories',          icon: 'fa-layer-group', color: '#ec4899', to: '/admin/category-requests' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.48 + i * 0.04 }}
            onClick={() => navigate(action.to)}
            className="w-full px-5 py-3.5 flex items-center gap-4 text-left transition-colors"
            style={{ borderBottom: i < 4 ? `1px solid ${t.border}` : 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = t.surfaceSub}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${action.color}14`,
                border: `1px solid ${action.color}26`,
              }}>
              <i className={`fa-solid ${action.icon} text-[12px]`} style={{ color: action.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>
                {action.label}
              </p>
              <p className="text-[11px]" style={{ color: t.textSub }}>{action.sub}</p>
            </div>

            <i className="fa-solid fa-chevron-right text-[10px]" style={{ color: t.textSub }} />
          </motion.button>
        ))}
      </motion.div>

    </AdminLayout>
  );
};

export default AdminDashboard;