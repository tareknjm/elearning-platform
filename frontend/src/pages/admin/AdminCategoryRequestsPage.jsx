import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck, faCircleXmark, faXmark,
  faLayerGroup, faTag, faUser, faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { getAllCategoryRequests, reviewCategoryRequest } from '../../services/categoryRequestService';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_CONFIG = {
  PENDING:  { label: 'En attente', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  APPROVED: { label: 'Approuvée',  color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  REJECTED: { label: 'Refusée',    color: '#fca5a5', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
};

const AdminCategoryRequestsPage = () => {
  const { dark } = useTheme();

  const [tab, setTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [toast, setToast] = useState(null);

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub     = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const cardBg      = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = dark ? 'rgba(99,102,241,0.12)' : '#e5e7eb';
  const accent      = '#6366f1';
  const accentLight = '#a5b4fc';

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllCategoryRequests();
      setRequests(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleReview = async (decision) => {
    setSubmitting(decision);
    try {
      await reviewCategoryRequest(modal.id, decision, adminNote);
      setToast({
        type: decision === 'APPROVE' ? 'success' : 'error',
        text: decision === 'APPROVE'
          ? 'Catégorie créée et instructeur notifié'
          : 'Demande refusée — instructeur notifié',
      });
      closeModal();
      load();
    } catch (err) {
      setToast({ type: 'error', text: err?.response?.data?.message || 'Erreur' });
    } finally {
      setSubmitting(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const closeModal = () => { setModal(null); setAdminNote(''); };

  const pending  = requests.filter(r => r.status === 'PENDING');
  const history  = requests.filter(r => r.status !== 'PENDING');
  const displayed = tab === 'pending' ? pending : history;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: accentLight }}>
            Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: textPrimary, letterSpacing: '-0.02em' }}>
            Demandes de catégories
          </h1>
          <p className="text-sm mt-1" style={{ color: textSub }}>
            Examinez les demandes de création de catégories soumises par les instructeurs.
          </p>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
              style={toast.type === 'success'
                ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }
                : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
              <FontAwesomeIcon icon={toast.type === 'success' ? faCircleCheck : faCircleXmark} />
              {toast.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'En attente', value: pending.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            { label: 'Approuvées', value: history.filter(r => r.status === 'APPROVED').length, color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
            { label: 'Refusées',   value: history.filter(r => r.status === 'REJECTED').length, color: '#fca5a5', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
              <p className="text-xs font-semibold mb-1" style={{ color: stat.color }}>{stat.label}</p>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'pending', label: 'En attente', count: pending.length },
            { key: 'history', label: 'Historique', count: history.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
              style={tab === t.key
                ? { background: `linear-gradient(135deg,${accent},#4f46e5)`, color: 'white' }
                : { background: cardBg, color: textSub, border: `1px solid ${cardBorder}` }}>
              {t.label}
              {t.count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={tab === t.key
                    ? { background: 'rgba(255,255,255,0.25)' }
                    : { background: 'rgba(99,102,241,0.15)', color: accentLight }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full"
              style={{ border: '2px solid rgba(99,102,241,0.2)', borderTopColor: accent }} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#10b981', fontSize: 32 }} className="mb-3" />
            <p className="font-semibold text-sm" style={{ color: textPrimary }}>
              {tab === 'pending' ? 'Aucune demande en attente' : 'Aucun historique'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((req, i) => {
              const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
              return (
                <motion.div key={req.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl p-5"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                        <FontAwesomeIcon icon={faLayerGroup} style={{ color: statusCfg.color, fontSize: 14 }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className="text-sm font-bold" style={{ color: textPrimary }}>
                            {req.categoryName}
                          </p>
                          {req.subCategoryName && (
                            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(99,102,241,0.1)', color: accentLight, border: '1px solid rgba(99,102,241,0.2)' }}>
                              <FontAwesomeIcon icon={faTag} style={{ fontSize: 8 }} />
                              {req.subCategoryName}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1.5 text-[11px]" style={{ color: textSub }}>
                            <FontAwesomeIcon icon={faUser} style={{ fontSize: 9 }} />
                            {req.instructorName}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px]" style={{ color: textSub }}>
                            <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 9 }} />
                            {formatDate(req.createdAt)}
                          </span>
                        </div>
                        {req.reason && (
                          <p className="text-xs mt-2 p-2.5 rounded-xl"
                            style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb', color: textSub }}>
                            "{req.reason}"
                          </p>
                        )}
                        {req.adminNote && (
                          <p className="text-xs mt-1.5 p-2.5 rounded-xl"
                            style={{ background: 'rgba(99,102,241,0.07)', color: accentLight, border: '1px solid rgba(99,102,241,0.15)' }}>
                            Note admin : {req.adminNote}
                          </p>
                        )}
                      </div>
                    </div>

                    {req.status === 'PENDING' && (
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setModal(req)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${accent},#4f46e5)` }}>
                        Décision
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal décision */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => !submitting && closeModal()}>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-7"
              style={{ background: dark ? '#0d0d1a' : '#ffffff', border: `1px solid ${cardBorder}` }}>

              <div className="flex items-center gap-3 mb-5">
                <button onClick={closeModal}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: textSub }}>
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
                </button>
                <div>
                  <h3 className="font-bold text-base" style={{ color: textPrimary }}>Décision</h3>
                  <p className="text-xs mt-0.5" style={{ color: textSub }}>
                    {modal.instructorName} · {modal.categoryName}
                    {modal.subCategoryName && ` / ${modal.subCategoryName}`}
                  </p>
                </div>
              </div>

              {/* Résumé */}
              <div className="p-3 rounded-xl mb-4"
                style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <FontAwesomeIcon icon={faLayerGroup} style={{ color: accentLight, fontSize: 12 }} />
                  <span className="text-xs font-semibold" style={{ color: textPrimary }}>{modal.categoryName}</span>
                </div>
                {modal.subCategoryName && (
                  <div className="flex items-center gap-2 mb-1.5 ml-4">
                    <FontAwesomeIcon icon={faTag} style={{ color: accentLight, fontSize: 11 }} />
                    <span className="text-xs" style={{ color: textSub }}>{modal.subCategoryName}</span>
                  </div>
                )}
                {modal.reason && (
                  <p className="text-xs mt-1.5" style={{ color: textSub }}>"{modal.reason}"</p>
                )}
              </div>

              {/* Conséquences */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-[11px] font-bold mb-1" style={{ color: '#34d399' }}>Si approuvée</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Catégorie créée automatiquement
                  </p>
                </div>
                <div className="p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-[11px] font-bold mb-1" style={{ color: '#fca5a5' }}>Si refusée</p>
                  <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Instructeur notifié du refus
                  </p>
                </div>
              </div>

              {/* Note admin */}
              <div className="mb-5">
                <label className="text-xs font-semibold mb-2 block" style={{ color: textSub }}>
                  Note administrative (optionnel)
                </label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Ex: Catégorie pertinente, ajoutée dans Informatique..."
                  className="w-full text-sm outline-none rounded-xl px-4 py-3 resize-none"
                  style={{
                    background: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                    border: `1px solid ${cardBorder}`,
                    color: textPrimary,
                  }}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleReview('REJECT')}
                  disabled={!!submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                  {submitting === 'REJECT' ? (
                    <motion.div animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full"
                      style={{ border: '2px solid rgba(248,113,113,0.3)', borderTopColor: '#f87171' }} />
                  ) : <FontAwesomeIcon icon={faCircleXmark} style={{ fontSize: 12 }} />}
                  Refuser
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleReview('APPROVE')}
                  disabled={!!submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg,${accent},#4f46e5)` }}>
                  {submitting === 'APPROVE' ? (
                    <motion.div animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full"
                      style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  ) : <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 12 }} />}
                  Approuver & créer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminCategoryRequestsPage;