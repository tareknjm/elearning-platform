import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const Icons = {
  users: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={color} strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  learner: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={color} strokeWidth="1.8">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  instructor: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={color} strokeWidth="1.8">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <path d="M9 8l2 2 4-4"/>
    </svg>
  ),
  admin: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke={color} strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  check: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke={color} strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  warn: (color) => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

const RoleBadgeIcon = ({ role }) => {
  if (role === 'ADMIN') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
  if (role === 'INSTRUCTOR') return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    </svg>
  );
};

const UsersPage = () => {
  const { dark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'LEARNER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.5)' : '#6b7280';
  const cardBg = dark ? '#0d0d1a' : '#ffffff';
  const cardBorder = dark ? 'rgba(99,102,241,0.12)' : '#e5e7eb';
  const inputStyle = {
    background: dark ? 'rgba(99,102,241,0.05)' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : '#e5e7eb'}`,
    borderRadius: '12px',
    color: textPrimary,
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
  };
  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '6px',
    color: dark ? '#a5b4fc' : '#6366f1',
  };
  const modalStyle = {
    background: dark ? '#0d0d1a' : '#ffffff',
    border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : '#e5e7eb'}`,
    borderRadius: '20px',
    padding: '28px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: dark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.12)',
  };

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setError('');
    if (!createForm.name || !createForm.email || !createForm.password) {
      setError('Tous les champs sont obligatoires'); return;
    }
    try {
      const response = await api.post('/admin/users', createForm);
      setUsers([...users, response.data]);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'LEARNER' });
      setSuccess('Utilisateur créé !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Erreur lors de la création'); }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setError('');
  };

  const handleUpdate = async () => {
    setError('');
    try {
      const response = await api.put(`/admin/users/${editUser.id}`, editForm);
      setUsers(users.map(u => u.id === editUser.id ? response.data : u));
      setEditUser(null);
      setSuccess('Utilisateur modifié !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError('Erreur lors de la modification'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setSuccess('Utilisateur supprimé.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la suppression');
      setTimeout(() => setError(''), 4000);
    }
  };

  const roleBadge = (role) => {
    const styles = {
      ADMIN:      { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   color: '#fca5a5', label: 'Admin' },
      INSTRUCTOR: { bg: 'rgba(139,92,246,0.15)',  border: 'rgba(139,92,246,0.3)',  color: '#c4b5fd', label: 'Instructor' },
      LEARNER:    { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)',  color: '#a5b4fc', label: 'Learner' },
    };
    const s = styles[role] || styles.LEARNER;
    return (
      <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit"
        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
        <RoleBadgeIcon role={role} />
        {s.label}
      </span>
    );
  };

  const roleStats = [
    { label: 'Total', value: users.length, icon: Icons.users('white'), gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', shadow: 'rgba(99,102,241,0.35)' },
    { label: 'Apprenants', value: users.filter(u => u.role === 'LEARNER').length, icon: Icons.learner('white'), gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', shadow: 'rgba(59,130,246,0.35)' },
    { label: 'Instructeurs', value: users.filter(u => u.role === 'INSTRUCTOR').length, icon: Icons.instructor('white'), gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', shadow: 'rgba(139,92,246,0.35)' },
    { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, icon: Icons.admin('white'), gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)', shadow: 'rgba(239,68,68,0.35)' },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Utilisateurs</h1>
          <p className="text-sm mt-1" style={{ color: '#6366f1' }}>{users.length} utilisateurs enregistrés</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setShowCreateModal(true); setError(''); }}
          className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nouvel utilisateur
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {roleStats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02, y: -2 }}
            className="rounded-2xl p-5 text-white relative overflow-hidden"
            style={{ background: s.gradient, boxShadow: `0 8px 24px ${s.shadow}` }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
            {Icons.check('#6ee7b7')} {success}
          </motion.div>
        )}
        {error && !editUser && !showCreateModal && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            {Icons.warn('#fca5a5')} {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl overflow-hidden p-6 space-y-3"
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-12 rounded-xl animate-pulse"
              style={{ background: dark ? 'rgba(99,102,241,0.05)' : '#f3f4f6' }} />
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.05)' }}>
          <table className="w-full">
            <thead style={{ borderBottom: `1px solid ${cardBorder}` }}>
              <tr>
                {['Utilisateur', 'Email', 'Rôle', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: '#6366f1' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr key={user.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: `1px solid ${cardBorder}` }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(99,102,241,0.05)' : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm" style={{ color: textPrimary }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: textSub }}>{user.email}</td>
                  <td className="px-5 py-4">{roleBadge(user.role)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(user)}
                        className="text-sm font-medium transition hover:underline"
                        style={{ color: '#818cf8' }}>Modifier</button>
                      <button onClick={() => handleDelete(user.id)}
                        className="text-sm font-medium transition hover:underline"
                        style={{ color: '#f87171' }}>Supprimer</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Modal Créer */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} style={modalStyle}>
              <h2 className="text-lg font-bold mb-6" style={{ color: textPrimary }}>Créer un utilisateur</h2>
              {error && (
                <div className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  {Icons.warn('#fca5a5')} {error}
                </div>
              )}
              <div className="space-y-4">
                {[
                  { label: 'Nom complet', key: 'name', type: 'text', placeholder: 'Ahmed Benali' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'ahmed@exemple.com' },
                  { label: 'Mot de passe', key: 'password', type: 'password', placeholder: '••••••••' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={labelStyle}>{field.label}</label>
                    <input type={field.type} value={createForm[field.key]}
                      onChange={e => setCreateForm({ ...createForm, [field.key]: e.target.value })}
                      style={inputStyle} placeholder={field.placeholder} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Rôle</label>
                  <select value={createForm.role} style={inputStyle}
                    onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                    <option value="LEARNER">Apprenant</option>
                    <option value="INSTRUCTOR">Instructeur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleCreate}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                  Créer
                </motion.button>
                <button onClick={() => { setShowCreateModal(false); setError(''); }}
                  className="flex-1 py-2.5 rounded-xl font-medium text-sm transition"
                  style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', border: `1px solid ${cardBorder}`, color: textSub }}>
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Modifier */}
      <AnimatePresence>
        {editUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }} style={modalStyle}>
              <h2 className="text-lg font-bold mb-6" style={{ color: textPrimary }}>Modifier l'utilisateur</h2>
              {error && (
                <div className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  {Icons.warn('#fca5a5')} {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input type="text" value={editForm.name} style={inputStyle}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={editForm.email} style={inputStyle}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Rôle</label>
                  <select value={editForm.role} style={inputStyle}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="LEARNER">Apprenant</option>
                    <option value="INSTRUCTOR">Instructeur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleUpdate}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                  Sauvegarder
                </motion.button>
                <button onClick={() => { setEditUser(null); setError(''); }}
                  className="flex-1 py-2.5 rounded-xl font-medium text-sm"
                  style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', border: `1px solid ${cardBorder}`, color: textSub }}>
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default UsersPage;