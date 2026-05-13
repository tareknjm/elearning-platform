import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import api from '../../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'LEARNER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
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
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
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
      ADMIN: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5', label: '🛡️ Admin' },
      INSTRUCTOR: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', color: '#c4b5fd', label: '👨‍🏫 Instructor' },
      LEARNER: { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', color: '#a5b4fc', label: '🎓 Learner' },
    };
    const s = styles[role] || styles.LEARNER;
    return (
      <span className="text-xs px-2.5 py-1 rounded-full font-medium"
        style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
        {s.label}
      </span>
    );
  };

  const roleStats = [
    { label: 'Total', value: users.length, icon: '👥', color: 'from-indigo-500 to-indigo-700' },
    { label: 'Apprenants', value: users.filter(u => u.role === 'LEARNER').length, icon: '🎓', color: 'from-blue-500 to-blue-700' },
    { label: 'Instructeurs', value: users.filter(u => u.role === 'INSTRUCTOR').length, icon: '👨‍🏫', color: 'from-violet-500 to-violet-700' },
    { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, icon: '🛡️', color: 'from-red-500 to-red-700' },
  ];

  const modalStyle = {
    background: '#0d0d1a',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '20px',
    padding: '28px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-indigo-400 text-sm mt-1">{users.length} utilisateurs enregistrés</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowCreateModal(true); setError(''); }}
          className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
          }}>
          + Nouvel utilisateur
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {roleStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-white/70 text-xs mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }}>
            ✅ {success}
          </motion.div>
        )}
        {error && !editUser && !showCreateModal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {loading ? (
        <div className="rounded-2xl overflow-hidden p-6 space-y-3"
          style={{ background: '#0d0d1a', border: '1px solid rgba(99,102,241,0.12)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="h-12 rounded-xl animate-pulse"
              style={{ background: 'rgba(99,102,241,0.05)' }}></div>
          ))}
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
                {['Utilisateur', 'Email', 'Rôle', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: '#6366f1' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="transition"
                  style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {user.email}
                  </td>
                  <td className="px-5 py-4">{roleBadge(user.role)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(user)}
                        className="text-sm font-medium transition hover:underline"
                        style={{ color: '#818cf8' }}>
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(user.id)}
                        className="text-sm font-medium transition hover:underline"
                        style={{ color: '#f87171' }}>
                        Supprimer
                      </button>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={modalStyle}>
              <h2 className="text-lg font-bold text-white mb-6">Créer un utilisateur</h2>

              {error && (
                <div className="p-3 rounded-xl mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-4">
                {[
                  { label: 'Nom complet', key: 'name', type: 'text', placeholder: 'Ahmed Benali' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'ahmed@exemple.com' },
                  { label: 'Mot de passe', key: 'password', type: 'password', placeholder: '••••••••' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="admin-label">{field.label}</label>
                    <input type={field.type} value={createForm[field.key]}
                      onChange={e => setCreateForm({ ...createForm, [field.key]: e.target.value })}
                      className="admin-input" placeholder={field.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="admin-label">Rôle</label>
                  <select value={createForm.role} className="admin-input"
                    onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                    <option value="LEARNER">🎓 Apprenant</option>
                    <option value="INSTRUCTOR">👨‍🏫 Instructeur</option>
                    <option value="ADMIN">🛡️ Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleCreate}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                  Créer
                </motion.button>
                <button onClick={() => { setShowCreateModal(false); setError(''); }}
                  className="flex-1 py-2.5 rounded-xl font-medium text-sm transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={modalStyle}>
              <h2 className="text-lg font-bold text-white mb-6">Modifier l'utilisateur</h2>

              {error && (
                <div className="p-3 rounded-xl mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="admin-label">Nom</label>
                  <input type="text" value={editForm.name} className="admin-input"
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Email</label>
                  <input type="email" value={editForm.email} className="admin-input"
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Rôle</label>
                  <select value={editForm.role} className="admin-input"
                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="LEARNER">🎓 Apprenant</option>
                    <option value="INSTRUCTOR">👨‍🏫 Instructeur</option>
                    <option value="ADMIN">🛡️ Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button whileHover={{ scale: 1.02 }} onClick={handleUpdate}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                  Sauvegarder
                </motion.button>
                <button onClick={() => { setEditUser(null); setError(''); }}
                  className="flex-1 py-2.5 rounded-xl font-medium text-sm transition"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
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