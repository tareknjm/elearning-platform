import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo, faArrowLeft, faArrowRight, faLock, faShieldHalved,
  faCalendarDays, faClock, faCheck, faCircleInfo, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { getAvailableSlots, bookVideoCall } from '../../services/videoCallService';
import { getMyEnrollments } from '../../services/enrollmentService';
const DURATION_MINUTES = 60;
const PRICE_PER_MINUTE = 0.5;
const PRICE = DURATION_MINUTES * PRICE_PER_MINUTE; // 30€

const DAY_LABELS = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

const formatSlotDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const dow = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.getDay()];
  return `${DAY_LABELS[dow]} ${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`;
};

/**
 * Popup de réservation d'appel 1-on-1.
 *
 * Deux modes :
 * - course fourni (depuis WatchCoursePage) → instructeur déduit directement, on saute "choix du cours"
 * - course = null (depuis le dashboard) → étape supplémentaire pour choisir le cours
 */
const VideoCallBookingModal = ({ isOpen, onClose, course = null }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState('course'); // 'course' | 'slot' | 'payment' | 'processing' | 'success'
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(course);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [cardForm, setCardForm] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCourse(course);
    setSelectedSlot(null);
    setCardForm({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
    setCardErrors({});

    if (course) setStep('slot');
    else { setStep('course'); loadMyCourses(); }
  }, [isOpen, course]);

  useEffect(() => {
    if (step === 'slot' && selectedCourse) loadSlots();
  }, [step, selectedCourse]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const loadMyCourses = async () => {
    setLoadingCourses(true);
    try {
const data = await getMyEnrollments();
setMyCourses(data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingCourses(false); }
  };

  const loadSlots = async () => {
    setLoadingSlots(true);
    setSlots([]);
    try {
      const instructorId = selectedCourse.instructorId ?? selectedCourse.id; // EnrollmentResponse ou CourseDTO
const courseId = selectedCourse.courseId ?? selectedCourse.id;
const data = await getAvailableSlots(instructorId, courseId);
      setSlots(data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingSlots(false); }
  };

  const handleSelectCourse = (c) => { setSelectedCourse(c); setStep('slot'); };
  const handleSelectSlot = (slot) => setSelectedSlot(slot);

  const formatCardNumber = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    return clean.length >= 2 ? clean.slice(0, 2) + '/' + clean.slice(2) : clean;
  };

  const validateCard = () => {
    const e = {};
    if (cardForm.cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Numéro invalide';
    if (!cardForm.cardName.trim()) e.cardName = 'Nom requis';
    if (cardForm.expiry.length < 5) e.expiry = 'Date invalide';
    if (cardForm.cvv.length < 3) e.cvv = 'CVV invalide';
    setCardErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validateCard()) return;
    setStep('processing');
    await new Promise(r => setTimeout(r, 2000));

    try {
      const scheduledAt = `${selectedSlot.date}T${String(selectedSlot.startHour).padStart(2, '0')}:00:00`;
await bookVideoCall({
  courseId: selectedCourse.courseId ?? selectedCourse.id,
  instructorId: selectedCourse.instructorId,
  scheduledAt,
  durationMinutes: DURATION_MINUTES,
});
      setStep('success');
    } catch (err) {
      console.error(err);
      setStep('payment');
      const message = err?.response?.data?.message || "Ce créneau n'est plus disponible. Veuillez en choisir un autre.";
      setCardErrors({ global: message });
    }
  };

  const handleClose = () => onClose();
  const goBack = () => {
    if (step === 'slot' && !course) { setStep('course'); return; }
    if (step === 'payment') { setStep('slot'); return; }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(8,7,26,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={() => { if (step !== 'processing') handleClose(); }}>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative w-[440px] rounded-3xl p-6"
          style={{
            background: 'linear-gradient(160deg,#12103a 0%,#16123f 60%,#0f0a28 100%)',
            border: '1px solid rgba(99,102,241,0.35)',
            boxShadow: '0 32px 80px rgba(99,102,241,0.25)',
            maxHeight: '85vh', overflowY: 'auto',
          }}>

          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)' }} />

          {/* ── Bouton fermer (toujours visible sauf pendant traitement/succès) ── */}
          {step !== 'processing' && step !== 'success' && (
            <button onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-20"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
            </button>
          )}

          <div className="relative z-10">
            <AnimatePresence mode="wait">

              {/* ── Choix du cours (mode dashboard) ── */}
              {step === 'course' && (
                <motion.div key="course" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}>
                      <FontAwesomeIcon icon={faVideo} style={{ color: '#818cf8', fontSize: 18 }} />
                    </div>
                    <div>
                      <h2 className="font-black text-white text-base leading-tight">Réserver un appel 1-on-1</h2>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Choisissez la formation concernée
                      </p>
                    </div>
                  </div>

                  {loadingCourses ? (
                    <div className="flex justify-center py-10">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 rounded-full" style={{ border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
                    </div>
                  ) : myCourses.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Vous n'êtes inscrit à aucune formation pour le moment.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                      {myCourses.map(c => (
                        <button key={c.id} onClick={() => handleSelectCourse(c)}
                          className="w-full text-left p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                          <div className="min-w-0">
<p className="text-sm font-semibold text-white truncate">{c.courseTitle}</p>
<p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
  Instructeur : {c.instructorName || 'N/A'}
</p>
                          </div>
                          <FontAwesomeIcon icon={faArrowRight} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, flexShrink: 0 }} />
                        </button>
                      ))}
                    </div>
                  )}

                  <button onClick={handleClose}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold mt-4"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    Annuler
                  </button>
                </motion.div>
              )}

              {/* ── Choix du créneau ── */}
              {step === 'slot' && (
                <motion.div key="slot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="flex items-center gap-3 mb-2">
                    {!course && (
                      <button onClick={goBack}
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                        <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 12 }} />
                      </button>
                    )}
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)' }}>
                      <FontAwesomeIcon icon={faCalendarDays} style={{ color: '#818cf8', fontSize: 18 }} />
                    </div>
                    <div className="min-w-0">
<h2 className="font-black text-white text-base leading-tight truncate">
  {selectedCourse?.courseTitle ?? selectedCourse?.title}
</h2>
<p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
  Avec {selectedCourse?.instructorName}
</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl my-4"
                    style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <FontAwesomeIcon icon={faClock} style={{ color: '#818cf8', fontSize: 11 }} />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Appel de <strong className="text-white">{DURATION_MINUTES} minutes</strong> — {PRICE.toFixed(2)}€
                    </p>
                  </div>

                  {loadingSlots ? (
                    <div className="flex justify-center py-10">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 rounded-full" style={{ border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faCircleInfo} style={{ color: 'rgba(255,255,255,0.25)', fontSize: 20 }} className="mb-2" />
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Aucun créneau disponible pour le moment.
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Réessayez plus tard ou contactez l'instructeur.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1 mb-4">
                      {slots.map((slot, i) => {
                        const isSelected = selectedSlot?.date === slot.date && selectedSlot?.startHour === slot.startHour;
                        return (
                          <button key={i} onClick={() => handleSelectSlot(slot)}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all"
                            style={{
                              background: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isSelected ? 'rgba(129,140,248,0.6)' : 'rgba(255,255,255,0.07)'}`,
                            }}>
                            <div>
                              <p className="text-xs font-semibold text-white">{formatSlotDate(slot.date)}</p>
                              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                {String(slot.startHour).padStart(2, '0')}h00 — {String(slot.startHour + 1).padStart(2, '0')}h00
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: '#6366f1' }}>
                                <FontAwesomeIcon icon={faCheck} style={{ color: 'white', fontSize: 9 }} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: selectedSlot ? 1.02 : 1 }} whileTap={{ scale: selectedSlot ? 0.98 : 1 }}
                    onClick={() => selectedSlot && setStep('payment')}
                    disabled={!selectedSlot}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: selectedSlot ? '0 8px 24px rgba(99,102,241,0.4)' : 'none' }}>
                    Continuer vers le paiement
                    <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
                  </motion.button>
                </motion.div>
              )}

              {/* ── Paiement ── */}
              {step === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={goBack}
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                      <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 12 }} />
                    </button>
                    <div>
                      <p className="font-bold text-white text-sm">Paiement sécurisé</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <FontAwesomeIcon icon={faLock} className="mr-1" style={{ color: '#6ee7b7', fontSize: 9 }} />
                        {formatSlotDate(selectedSlot.date)} à {String(selectedSlot.startHour).padStart(2, '0')}h00 · {PRICE.toFixed(2)}€
                      </p>
                    </div>
                  </div>

                  {cardErrors.global && (
                    <div className="p-3 rounded-xl text-xs mb-4 text-center"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                      {cardErrors.global}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div>
                      <input type="text" placeholder="Numéro de carte"
                        value={cardForm.cardNumber}
                        onChange={e => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cardErrors.cardNumber ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }} />
                      {cardErrors.cardNumber && <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>{cardErrors.cardNumber}</p>}
                    </div>
                    <div>
                      <input type="text" placeholder="Nom sur la carte"
                        value={cardForm.cardName}
                        onChange={e => setCardForm({ ...cardForm, cardName: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                        style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cardErrors.cardName ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }} />
                      {cardErrors.cardName && <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>{cardErrors.cardName}</p>}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input type="text" placeholder="MM/YY"
                          value={cardForm.expiry}
                          onChange={e => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cardErrors.expiry ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }} />
                        {cardErrors.expiry && <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>{cardErrors.expiry}</p>}
                      </div>
                      <div className="flex-1">
                        <input type="text" placeholder="CVV"
                          value={cardForm.cvv}
                          onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                          style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cardErrors.cvv ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }} />
                        {cardErrors.cvv && <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>{cardErrors.cvv}</p>}
                      </div>
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handlePay}
                      className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-1"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                      <FontAwesomeIcon icon={faLock} style={{ fontSize: 10 }} />
                      Payer {PRICE.toFixed(2)}€
                    </motion.button>
                    <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <FontAwesomeIcon icon={faShieldHalved} className="mr-1" />
                      Paiement 100% simulé
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Traitement ── */}
              {step === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-center py-10">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    className="w-14 h-14 rounded-full mb-5"
                    style={{ border: '3px solid rgba(99,102,241,0.15)', borderTopColor: '#6366f1' }} />
                  <h3 className="font-bold text-white text-base mb-1">Confirmation en cours...</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Réservation de votre créneau</p>
                </motion.div>
              )}

              {/* ── Succès ── */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}>
                    <FontAwesomeIcon icon={faCheck} style={{ color: 'white', fontSize: 24 }} />
                  </motion.div>
                  <h3 className="font-black text-white text-lg mb-1">Appel confirmé ! 🎉</h3>
                  <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {formatSlotDate(selectedSlot.date)} à {String(selectedSlot.startHour).padStart(2, '0')}h00
                  </p>
                  <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Un email de confirmation vous a été envoyé.
                  </p>
                  <div className="flex gap-2 w-full">
                    <button onClick={handleClose}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Fermer
                    </button>
                    <button onClick={() => { handleClose(); navigate('/learner/video-calls'); }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
                      Voir mes appels
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallBookingModal;