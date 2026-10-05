import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileMedical, faCalendarDays, faClock, faUpload,
  faCircleCheck, faTriangleExclamation, faXmark, faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { useTheme } from '../../context/ThemeContext';
import { getInstructorVideoCalls, submitAbsenceJustification } from '../../services/videoCallService';

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
};

const InstructorAbsencePage = () => {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBookingId = searchParams.get('booking');

  const [absentCalls, setAbsentCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // booking sélectionné
  const [file, setFile] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub     = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const cardBg      = dark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const cardBorder  = dark ? 'rgba(16,185,129,0.12)' : '#e5e7eb';
  const accentLight = dark ? '#6ee7b7' : '#059669';

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getInstructorVideoCalls();
      const absences = (data || []).filter(b => b.status === 'ABSENT');
      setAbsentCalls(absences);

      // Ouvrir directement le modal si bookingId passé en param
      if (preselectedBookingId) {
        const target = absences.find(b => String(b.id) === preselectedBookingId);
        if (target) setModal(target);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) { setError('Veuillez sélectionner un fichier'); return; }
    if (!reason.trim()) { setError('Veuillez indiquer une raison'); return; }
    setError('');
    setSubmitting(true);
    try {
      await submitAbsenceJustification(modal.id, file, reason);
      setSuccess(true);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setFile(null);
    setReason('');
    setError('');
    setSuccess(false);
  };

  return (
    <InstructorLayout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: accentLight }}>
            Gestion des absences
          </p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: textPrimary, letterSpacing: '-0.02em' }}>
            Mes absences
          </h1>
          <p className="text-sm mt-1" style={{ color: textSub }}>
            Soumettez un justificatif médical dans les 48h suivant votre absence pour éviter une amende.
          </p>
        </div>

        {/* Bannière info */}

<div className="flex items-start gap-3 p-4 rounded-2xl mb-6"
  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.18)' }}>
  <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#f59e0b', fontSize: 14, marginTop: 2 }} />
  <div>
    <p className="text-[13px] font-semibold" style={{ color: '#f59e0b' }}>Délai de 48h</p>
    <p className="text-[12px] mt-0.5" style={{ color: textSub }}>
      Toute absence non justifiée sous 48h entraîne une amende de 30€. Uploadez votre certificat médical dès que possible.
    </p>
  </div>
</div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full"
              style={{ border: '2px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981' }} />
          </div>
        ) : absentCalls.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <FontAwesomeIcon icon={faCircleCheck} style={{ color: '#10b981', fontSize: 32 }} className="mb-3" />
            <p className="font-semibold text-sm" style={{ color: textPrimary }}>Aucune absence enregistrée</p>
            <p className="text-xs mt-1" style={{ color: textSub }}>Vous avez été présent à tous vos appels.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {absentCalls.map((booking, i) => (
              <motion.div key={booking.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#fca5a5', fontSize: 14 }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: textPrimary }}>
                      {booking.course?.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: textSub }}>
                      Avec {booking.learner?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: textSub }}>
                        <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 9 }} />
                        {formatDateTime(booking.scheduledAt)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: textSub }}>
                        <FontAwesomeIcon icon={faClock} style={{ fontSize: 9 }} />
                        {booking.durationMinutes} min
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setModal(booking)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
                  <FontAwesomeIcon icon={faFileMedical} style={{ fontSize: 11 }} />
                  Soumettre un justificatif
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal upload justificatif */}
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
              style={{ background: dark ? '#0d1a14' : '#ffffff', border: `1px solid ${cardBorder}` }}>

              {success ? (
                <div className="text-center py-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: 'white', fontSize: 28 }} />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: textPrimary }}>
                    Justificatif envoyé !
                  </h3>
                  <p className="text-sm mb-5" style={{ color: textSub }}>
                    L'administration examinera votre certificat médical et vous notifiera de la décision.
                  </p>
                  <button onClick={closeModal}
                    className="w-full py-3 rounded-xl font-semibold text-white text-sm"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  {/* Header modal */}
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={closeModal}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: textSub }}>
                      <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
                    </button>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: textPrimary }}>
                        Justificatif d'absence
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: textSub }}>
                        {modal.course?.title} · {formatDateTime(modal.scheduledAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">

                    {/* Upload fichier */}
                    <div>
                      <label className="text-xs font-semibold mb-2 block" style={{ color: textSub }}>
                        Certificat médical (PDF, JPG, PNG)
                      </label>
                      <label className="flex flex-col items-center justify-center w-full h-28 rounded-2xl cursor-pointer transition-all"
                        style={{
                          background: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                          border: `2px dashed ${file ? '#10b981' : cardBorder}`,
                        }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}>
                        <FontAwesomeIcon icon={faUpload}
                          style={{ color: file ? '#10b981' : textSub, fontSize: 18 }} className="mb-2" />
                        <p className="text-xs font-medium" style={{ color: file ? '#10b981' : textSub }}>
                          {file ? file.name : 'Glissez un fichier ou cliquez pour choisir'}
                        </p>
                        {file && (
                          <p className="text-[10px] mt-1" style={{ color: textSub }}>
                            {(file.size / 1024).toFixed(0)} Ko
                          </p>
                        )}
                        <input type="file" className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => setFile(e.target.files[0])} />
                      </label>
                    </div>

                    {/* Raison */}
                    <div>
                      <label className="text-xs font-semibold mb-2 block" style={{ color: textSub }}>
                        Explication
                      </label>
                      <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        placeholder="Ex: Hospitalisation d'urgence le jour de l'appel..."
                        className="w-full text-sm outline-none rounded-xl px-4 py-3 resize-none"
                        style={{
                          background: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                          border: `1px solid ${cardBorder}`,
                          color: textPrimary,
                        }}
                      />
                    </div>

                    {error && (
                      <p className="text-xs font-medium" style={{ color: '#f87171' }}>{error}</p>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button onClick={closeModal}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold"
                        style={{ color: textSub, border: `1px solid ${cardBorder}` }}>
                        Annuler
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                        {submitting ? (
                          <>
                            <motion.div animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 rounded-full"
                              style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faUpload} style={{ fontSize: 11 }} />
                            Soumettre
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </InstructorLayout>
  );
};

export default InstructorAbsencePage;