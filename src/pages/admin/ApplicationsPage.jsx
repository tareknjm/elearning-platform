import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import {
  getAllApplications,
  reviewApplication,
} from '../../services/applicationService';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    decision: '',
    adminNote: '',
    temporaryPassword: 'Instructor@2026',
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await getAllApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision) => {
    setReviewLoading(true);
    setError('');
    try {
      const updated = await reviewApplication(selected.id, {
        ...reviewForm,
        decision,
      });
      setApplications(applications.map(a =>
        a.id === selected.id ? updated : a
      ));
      setSuccess(
        decision === 'APPROVE'
          ? `✅ Candidature approuvée ! Compte créé pour ${selected.fullName}`
          : '❌ Candidature refusée.'
      );
      setSelected(null);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Erreur lors du traitement');
    } finally {
      setReviewLoading(false);
    }
  };

  const filtered = filter === 'ALL'
    ? applications
    : applications.filter(a => a.status === filter);

  const statusConfig = {
    PENDING: { label: '⏳ En attente', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    APPROVED: { label: '✅ Approuvée', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    REJECTED: { label: '❌ Refusée', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  };

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  const modalStyle = {
    background: '#0d0d1a',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '24px',
    padding: '28px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
  };

  const inputStyle = {
    background: 'rgba(99,102,241,0.05)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px',
    color: 'white',
    width: '100%',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Candidatures Instructeurs
          </h1>
          <p className="text-indigo-400 text-sm mt-1">
            {counts.PENDING} candidature(s) en attente
          </p>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-5 text-sm"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#6ee7b7',
            }}>
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'ALL', label: 'Toutes' },
          { key: 'PENDING', label: 'En attente' },
          { key: 'APPROVED', label: 'Approuvées' },
          { key: 'REJECTED', label: 'Refusées' },
        ].map(f => (
          <motion.button
            key={f.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
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
                background: filter === f.key
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(99,102,241,0.2)',
                color: filter === f.key ? 'white' : '#a5b4fc',
              }}>
              {counts[f.key]}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl p-6 animate-pulse h-24"
              style={{
                background: '#0d0d1a',
                border: '1px solid rgba(99,102,241,0.12)',
              }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{
            background: '#0d0d1a',
            border: '1px solid rgba(99,102,241,0.12)',
          }}>
          <div className="text-4xl mb-3">📭</div>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>
            Aucune candidature dans cette catégorie
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((app, i) => {
              const sc = statusConfig[app.status] || statusConfig.PENDING;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setSelected(app);
                    setReviewForm({
                      decision: '',
                      adminNote: '',
                      temporaryPassword: 'Instructor@2026',
                    });
                    setError('');
                  }}
                  className="rounded-2xl p-5 cursor-pointer transition flex items-center justify-between gap-4"
                  style={{
                    background: '#0d0d1a',
                    border: '1px solid rgba(99,102,241,0.12)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.12)'}>

                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {app.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{app.fullName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {app.email} • {app.speciality} • {app.experience}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
                      {sc.label}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {app.appliedAt}
                    </span>
                    <span style={{ color: 'rgba(99,102,241,0.5)' }}>→</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal détail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={modalStyle}>

              {/* Header modal */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {selected.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">{selected.fullName}</h2>
                    <p className="text-sm" style={{ color: '#a5b4fc' }}>
                      {selected.speciality}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-white transition text-xl">
                  ✕
                </button>
              </div>

              {/* Infos candidat */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Email', value: selected.email },
                  { label: 'Téléphone', value: selected.phone },
                  { label: 'Niveau', value: selected.educationLevel },
                  { label: 'Expérience', value: selected.experience },
                  { label: 'Spécialité', value: selected.speciality },
                  { label: 'Date', value: selected.appliedAt },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3"
                    style={{
                      background: 'rgba(99,102,241,0.05)',
                      border: '1px solid rgba(99,102,241,0.1)',
                    }}>
                    <p className="text-xs mb-0.5" style={{ color: '#6366f1' }}>
                      {item.label}
                    </p>
                    <p className="text-sm text-white font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* LinkedIn */}
              {selected.linkedinUrl && (
                <div className="mb-4">
                  <p className="text-xs mb-1" style={{ color: '#a5b4fc' }}>LinkedIn</p>
                  <a href={selected.linkedinUrl} target="_blank" rel="noreferrer"
                    className="text-sm font-medium transition"
                    style={{ color: '#818cf8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c4b5fd'}
                    onMouseLeave={e => e.currentTarget.style.color = '#818cf8'}>
                    {selected.linkedinUrl}
                  </a>
                </div>
              )}

              {/* Motivation */}
              <div className="rounded-xl p-4 mb-5"
                style={{
                  background: 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.1)',
                }}>
                <p className="text-xs mb-2 font-semibold" style={{ color: '#a5b4fc' }}>
                  ✍️ Lettre de motivation
                </p>
                <p className="text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {selected.motivation}
                </p>
              </div>

              {/* Actions si en attente */}
              {selected.status === 'PENDING' && (
                <div>
                  <p className="text-sm font-semibold text-white mb-3">
                    📋 Traiter cette candidature
                  </p>

                  {error && (
                    <div className="p-3 rounded-xl mb-3 text-sm"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#fca5a5',
                      }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block"
                        style={{ color: '#a5b4fc' }}>
                        Note admin (optionnel)
                      </label>
                      <textarea
                        value={reviewForm.adminNote}
                        onChange={e => setReviewForm({
                          ...reviewForm, adminNote: e.target.value
                        })}
                        rows={2}
                        style={inputStyle}
                        className="resize-none"
                        placeholder="Raison de l'approbation ou du refus..." />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block"
                        style={{ color: '#a5b4fc' }}>
                        Mot de passe temporaire (si approuvé)
                      </label>
                      <input
                        type="text"
                        value={reviewForm.temporaryPassword}
                        onChange={e => setReviewForm({
                          ...reviewForm, temporaryPassword: e.target.value
                        })}
                        style={inputStyle}
                        placeholder="Instructor@2026" />
                      <p className="text-xs mt-1"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                        Ce mot de passe sera communiqué à l'instructeur par email
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={reviewLoading}
                      onClick={() => handleReview('APPROVE')}
                      className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                      }}>
                      {reviewLoading ? '...' : '✅ Approuver & Créer le compte'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={reviewLoading}
                      onClick={() => handleReview('REJECT')}
                      className="flex-1 py-3 rounded-xl font-bold disabled:opacity-50"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5',
                      }}>
                      {reviewLoading ? '...' : '❌ Refuser'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Déjà traité */}
              {selected.status !== 'PENDING' && (
                <div className="rounded-xl p-4"
                  style={{
                    background: selected.status === 'APPROVED'
                      ? 'rgba(16,185,129,0.08)'
                      : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${selected.status === 'APPROVED'
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  <p className="text-sm font-bold"
                    style={{
                      color: selected.status === 'APPROVED' ? '#6ee7b7' : '#fca5a5',
                    }}>
                    {selected.status === 'APPROVED'
                      ? '✅ Candidature approuvée — Compte instructeur créé'
                      : '❌ Candidature refusée'}
                  </p>
                  {selected.adminNote && (
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Note : {selected.adminNote}
                    </p>
                  )}
                  {selected.reviewedAt && (
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Traitée le {selected.reviewedAt}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default ApplicationsPage;