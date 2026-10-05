import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown, faCheck, faArrowRight, faXmark, faBolt, faArrowLeft,
  faLock, faShieldHalved, faChevronLeft, faChevronRight,
  faPlay, faCheckCircle as faCheckCircleSolid, faMagnifyingGlass,
  faGraduationCap, faDownload, faClipboardCheck, faVideo
} from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import { useTheme } from '../../context/ThemeContext';
import { getVideosByCourse } from '../../services/videoService';
import VideoCallBookingModal from '../../components/modals/VideoCallBookingModal';
import { getCourseById } from '../../services/courseService';
import { markVideoWatched, getCourseProgress } from '../../services/progressService';
import { hasPassed, downloadCertificate } from '../../services/quizService';
import { activateSubscription } from '../../services/subscriptionService';
import { resolveMediaUrl } from '../../utils/media';

const WatchCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [searchParams] = useSearchParams();

  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [watchedIds, setWatchedIds] = useState(new Set());
  const [progress, setProgress] = useState(null);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [modalStep, setModalStep] = useState('offer');
  const [modalBilling, setModalBilling] = useState('monthly');
  const [cardForm, setCardForm] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
  const [cardErrors, setCardErrors] = useState({});

  // ── Tokens
  const t = {
    textPrimary:  dark ? '#ffffff'                : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.5)'  : '#6b7280',
    surface:      dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    surfaceSub:   dark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
    border:       dark ? 'rgba(255,255,255,0.08)' : '#ebebeb',
    shadow:       dark ? 'none'                   : '0 1px 12px rgba(0,0,0,0.05)',
    accent:       '#6366f1',
    accentBg:     dark ? 'rgba(99,102,241,0.12)'  : 'rgba(99,102,241,0.07)',
    accentBorder: dark ? 'rgba(99,102,241,0.3)'   : 'rgba(99,102,241,0.18)',
    accentText:   dark ? '#a5b4fc'                : '#4f46e5',
  };

  useEffect(() => { loadAll(); }, [courseId]);

  useEffect(() => {
    document.body.style.overflow = (showPremiumModal || showBookingModal) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showPremiumModal, showBookingModal]);

  const loadAll = async () => {
    try {
      const [courseData, videosData, progressData, passedData] = await Promise.all([
        getCourseById(courseId), getVideosByCourse(courseId),
        getCourseProgress(courseId), hasPassed(courseId),
      ]);
      setCourse(courseData); setVideos(videosData);
      setProgress(progressData); setPassed(passedData);
      if (videosData.length > 0) {
        const videoIdParam = searchParams.get('video');
        const target = videoIdParam ? videosData.find(v => v.id === Number(videoIdParam)) : null;
        setCurrentVideo(target || videosData[0]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleVideoEnd = async () => {
    if (!currentVideo) return;
    try {
      await markVideoWatched(currentVideo.id);
      setWatchedIds(prev => new Set([...prev, currentVideo.id]));
      setProgress(await getCourseProgress(courseId));
    } catch (err) { console.error(err); }
  };

  const handleDownloadCert = async () => {
    setCertLoading(true);
    try { await downloadCertificate(courseId); }
    catch (err) { console.error(err); }
    finally { setCertLoading(false); }
  };

  const handleVideoClick = (video) => {
    if (video.locked) { setShowPremiumModal(true); return; }
    setCurrentVideo(video);
  };

  const formatCardNumber = (val) => val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (val) => {
    const c = val.replace(/\D/g,'').slice(0,4);
    return c.length >= 2 ? c.slice(0,2) + '/' + c.slice(2) : c;
  };

  const validateCard = () => {
    const e = {};
    if (cardForm.cardNumber.replace(/\s/g,'').length < 16) e.cardNumber = 'Numéro invalide';
    if (!cardForm.cardName.trim()) e.cardName = 'Nom requis';
    if (cardForm.expiry.length < 5) e.expiry = 'Date invalide';
    if (cardForm.cvv.length < 3) e.cvv = 'CVV invalide';
    setCardErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validateCard()) return;
    setModalStep('processing');
    await new Promise(r => setTimeout(r, 2200));
    try { await activateSubscription(modalBilling); setModalStep('success'); loadAll(); }
    catch { setModalStep('form'); setCardErrors({ global: "Erreur lors de l'activation. Réessayez." }); }
  };

  const closePremiumModal = () => {
    setShowPremiumModal(false); setModalStep('offer');
    setCardForm({ cardNumber: '', cardName: '', expiry: '', cvv: '' }); setCardErrors({});
  };

  const progressPercent = progress?.progressPercent || 0;
  const isCompleted     = progress?.completed || false;
  const watchedCount    = progress?.watchedVideos || 0;

  const goToPrev = () => {
    const prev = videos.find(v => v.orderIndex === currentVideo.orderIndex - 1);
    if (prev && !prev.locked) setCurrentVideo(prev);
    else if (prev?.locked) setShowPremiumModal(true);
  };
  const goToNext = () => {
    const next = videos.find(v => v.orderIndex === currentVideo.orderIndex + 1);
    if (next && !next.locked) setCurrentVideo(next);
    else if (next?.locked) setShowPremiumModal(true);
  };

  const filteredVideos = search.trim()
    ? videos.filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
    : videos;

  if (loading) return (
    <LearnerLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-7 h-7 rounded-full"
          style={{ border: `2px solid ${t.accentBorder}`, borderTopColor: t.accent }} />
      </div>
    </LearnerLayout>
  );

  return (
    <LearnerLayout>
      <div className="max-w-[1300px] mx-auto">

        {/* ── Breadcrumb ── */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-5 flex-wrap">
          <button onClick={() => navigate('/learner/dashboard')}
            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{
              color: t.textSub,
              background: t.surfaceSub,
              border: `1px solid ${t.border}`,
            }}
            onMouseEnter={e => e.currentTarget.style.color = t.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = t.textSub}>
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 9 }} />
            Tableau de bord
          </button>
          <span style={{ color: t.border }}>›</span>
          <span className="text-[12px] truncate max-w-[280px]" style={{ color: t.textSub }}>
            {course?.title}
          </span>

          {/* Actions droite */}
          <div className="ml-auto flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accentText }}>
              <FontAwesomeIcon icon={faVideo} style={{ fontSize: 10 }} />
              Réserver un 1-on-1
            </motion.button>

            {isCompleted && !passed && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/learner/courses/${courseId}/quiz`)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                <FontAwesomeIcon icon={faClipboardCheck} style={{ fontSize: 10 }} />
                Passer le quiz
              </motion.button>
            )}
            {passed && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleDownloadCert} disabled={certLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                <FontAwesomeIcon icon={faDownload} style={{ fontSize: 10 }} />
                {certLoading ? 'Génération...' : 'Certificat'}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── Layout principal ── */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ════ LECTEUR ════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            <AnimatePresence mode="wait">
              {currentVideo && (
                <motion.div key={currentVideo.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}>

                  {currentVideo.locked ? (
                    <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center"
                      style={{
                        minHeight: '400px',
                        background: dark
                          ? 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.04))'
                          : 'linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.03))',
                        border: `1px solid ${t.accentBorder}`,
                      }}>
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="flex flex-col items-center px-8">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}>
                          <FontAwesomeIcon icon={faLock} style={{ color: t.accentText, fontSize: 18 }} />
                        </div>
                        <h3 className="font-bold text-[15px] mb-2" style={{ color: t.textPrimary }}>
                          Contenu Premium
                        </h3>
                        <p className="text-[12px] mb-5 max-w-xs" style={{ color: t.textSub, lineHeight: 1.6 }}>
                          Cette vidéo est réservée aux membres Premium.
                        </p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setShowPremiumModal(true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-[13px]"
                          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                          <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24', fontSize: 11 }} />
                          Débloquer avec Premium
                        </motion.button>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden"
                      style={{ background: '#000', boxShadow: dark ? '0 16px 48px rgba(99,102,241,0.2)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
                      <video key={currentVideo.id} controls autoPlay onEnded={handleVideoEnd}
                        className="w-full block" style={{ aspectRatio: '16/9', maxHeight: '480px' }}
                        src={resolveMediaUrl(currentVideo.url)} />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white pointer-events-none"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
                        {currentVideo.orderIndex} / {videos.length}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Infos + navigation */}
            {currentVideo && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-[15px] font-semibold truncate" style={{ color: t.textPrimary }}>
                      {currentVideo.title}
                    </h2>
                    {watchedIds.has(currentVideo.id) && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <FontAwesomeIcon icon={faCheckCircleSolid} style={{ fontSize: 7 }} />
                        Vue
                      </span>
                    )}
                  </div>
                  <p className="text-[11px]" style={{ color: t.textSub }}>
                    Leçon {currentVideo.orderIndex} sur {videos.length} · {course?.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={goToPrev} disabled={currentVideo.orderIndex <= 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: t.surfaceSub, border: `1px solid ${t.border}`, color: t.textSub }}>
                    <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 11 }} />
                  </button>
                  <button onClick={goToNext} disabled={currentVideo.orderIndex >= videos.length}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-white disabled:opacity-30"
                    style={{ background: t.accent }}>
                    Suivant
                    <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9 }} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bannière complétion */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-2xl p-4 flex items-center justify-between gap-4"
                  style={passed ? {
                    background: dark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.2)',
                  } : {
                    background: dark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: passed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)' }}>
                      <FontAwesomeIcon icon={passed ? faGraduationCap : faClipboardCheck}
                        style={{ color: passed ? '#10b981' : '#f59e0b', fontSize: 15 }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: passed ? '#10b981' : '#f59e0b' }}>
                        {passed ? 'Formation validée !' : 'Toutes les vidéos vues'}
                      </p>
                      <p className="text-[11px]" style={{ color: passed ? 'rgba(16,185,129,0.7)' : 'rgba(245,158,11,0.7)' }}>
                        {passed ? 'Votre certificat est disponible' : 'Passez le quiz final pour obtenir votre certificat'}
                      </p>
                    </div>
                  </div>
                  {passed ? (
                    <button onClick={handleDownloadCert} disabled={certLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-white disabled:opacity-50 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: 10 }} />
                      {certLoading ? 'Génération...' : 'Télécharger'}
                    </button>
                  ) : (
                    <button onClick={() => navigate(`/learner/courses/${courseId}/quiz`)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                      Passer le quiz
                      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9 }} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ════ PLAYLIST ════ */}
          <div className="w-full lg:w-[268px] flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
              maxHeight: '580px',
            }}>

            {/* Header playlist */}
            <div className="p-3.5" style={{ borderBottom: `1px solid ${t.border}` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-semibold" style={{ color: t.textPrimary }}>
                  Contenu du cours
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium" style={{ color: t.textSub }}>
                    {watchedCount}/{videos.length}
                  </span>
                  <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: t.border }}>
                    <motion.div className="h-full rounded-full"
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6 }}
                      style={{ background: progressPercent === 100 ? '#10b981' : t.accent }} />
                  </div>
                </div>
              </div>
              <div className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: t.textSub, fontSize: 10 }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-[11px] outline-none"
                  style={{ background: t.surfaceSub, border: `1px solid ${t.border}`, color: t.textPrimary }} />
              </div>
            </div>

            {/* Liste vidéos */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredVideos.map((video, idx) => {
                const isWatched = watchedIds.has(video.id) || (watchedCount >= video.orderIndex);
                const isCurrent = currentVideo?.id === video.id;

                return (
                  <motion.button key={video.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => handleVideoClick(video)}
                    className="w-full text-left p-2.5 rounded-xl mb-1 flex items-center gap-2.5 transition-all relative"
                    style={isCurrent ? {
                      background: t.accentBg,
                      border: `1px solid ${t.accentBorder}`,
                    } : {
                      background: 'transparent',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = t.surfaceSub; }}
                    onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}>

                    {isCurrent && (
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                        style={{ background: t.accent }} />
                    )}

                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                      style={video.locked ? {
                        background: t.accentBg,
                        border: `1px solid ${t.accentBorder}`,
                      } : isWatched ? {
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)',
                      } : isCurrent ? {
                        background: t.accentBg,
                        border: `1px solid ${t.accentBorder}`,
                      } : {
                        background: t.surfaceSub,
                        border: `1px solid ${t.border}`,
                      }}>
                      {video.locked
                        ? <FontAwesomeIcon icon={faLock} style={{ color: t.accentText, fontSize: 8 }} />
                        : isWatched
                          ? <FontAwesomeIcon icon={faCheck} style={{ color: '#10b981', fontSize: 8 }} />
                          : isCurrent
                            ? <FontAwesomeIcon icon={faPlay} style={{ color: t.accentText, fontSize: 7 }} />
                            : <span style={{ color: t.textSub }}>{video.orderIndex}</span>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate"
                        style={{ color: isCurrent ? t.textPrimary : isWatched ? t.textSub : video.locked ? t.textSub : t.textPrimary }}>
                        {video.title}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: t.textSub }}>
                        Leçon {video.orderIndex}
                      </p>
                    </div>

                    {video.locked && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: t.accentBg, color: t.accentText, border: `1px solid ${t.accentBorder}` }}>
                        PRO
                      </span>
                    )}
                  </motion.button>
                );
              })}

              {isCompleted && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => navigate(`/learner/courses/${courseId}/quiz`)}
                  className="w-full text-left p-2.5 rounded-xl mt-1 flex items-center gap-2.5 transition-all"
                  style={passed ? {
                    background: 'rgba(16,185,129,0.07)',
                    border: '1px solid rgba(16,185,129,0.18)',
                  } : {
                    background: 'rgba(245,158,11,0.07)',
                    border: '1px solid rgba(245,158,11,0.18)',
                  }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px]"
                    style={{ background: passed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)' }}>
                    {passed ? '🏆' : '📝'}
                  </div>
                  <span className="text-[11px] font-semibold"
                    style={{ color: passed ? '#10b981' : '#f59e0b' }}>
                    {passed ? 'Quiz réussi' : 'Quiz final'}
                  </span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════ MODAL PREMIUM (identique à l'original) ════ */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(8,7,26,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.stopPropagation()}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              className="relative w-[420px] rounded-3xl p-6"
              style={{
                background: 'linear-gradient(160deg,#12103a 0%,#16123f 60%,#0f0a28 100%)',
                border: '1px solid rgba(139,92,246,0.35)',
                boxShadow: '0 32px 80px rgba(139,92,246,0.3)',
              }}>
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)' }} />
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  {modalStep === 'offer' && (
                    <motion.div key="offer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.35)' }}>
                          <FontAwesomeIcon icon={faCrown} style={{ color: '#fbbf24', fontSize: 20 }} />
                        </div>
                        <div>
                          <h2 className="font-black text-white text-base leading-tight">Contenu Premium</h2>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Réservé aux membres Premium</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-5">
                        {['Toutes les vidéos débloquées', 'Sessions 1-on-1 avec instructeurs', 'Formations illimitées incluses'].map((f, i) => (
                          <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)' }}>
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.3)' }}>
                              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 7, color: '#a78bfa' }} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{f}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mb-5">
                        {[{ key: 'monthly', label: 'Mensuel', price: '19€/mois' }, { key: 'yearly', label: 'Annuel', price: '15€/mois', badge: '-21%' }].map(plan => (
                          <button key={plan.key} onClick={() => setModalBilling(plan.key)}
                            className="flex-1 p-3 rounded-2xl text-left relative transition-all"
                            style={{
                              background: modalBilling === plan.key ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${modalBilling === plan.key ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.08)'}`,
                            }}>
                            {plan.badge && <span className="absolute -top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: '#10b981', color: 'white' }}>{plan.badge}</span>}
                            <p className="text-[10px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{plan.label}</p>
                            <p className="font-black text-white text-lg leading-none">{plan.price.split('/')[0]}<span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>/{plan.price.split('/')[1]}</span></p>
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-col gap-2">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setModalStep('form')}
                          className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                          <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10 }} /> Continuer
                          <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 10 }} />
                        </motion.button>
                        <button onClick={() => { closePremiumModal(); navigate(-1); }}
                          className="w-full py-2.5 rounded-xl text-xs font-semibold"
                          style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          Plus tard
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {modalStep === 'form' && (
                    <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <button onClick={() => setModalStep('offer')}
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: 12 }} />
                        </button>
                        <div>
                          <p className="font-bold text-white text-sm">Paiement sécurisé</p>
                          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <FontAwesomeIcon icon={faLock} className="mr-1" style={{ color: '#6ee7b7', fontSize: 9 }} />
                            {modalBilling === 'yearly' ? '180€/an · économisez 48€' : '19€/mois'}
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
                        {[
                          { key: 'cardNumber', placeholder: 'Numéro de carte', val: cardForm.cardNumber, onChange: e => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) }) },
                          { key: 'cardName', placeholder: 'Nom sur la carte', val: cardForm.cardName, onChange: e => setCardForm({ ...cardForm, cardName: e.target.value.toUpperCase() }) },
                        ].map(f => (
                          <div key={f.key}>
                            <input type="text" placeholder={f.placeholder} value={f.val} onChange={f.onChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cardErrors[f.key] ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }} />
                            {cardErrors[f.key] && <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>{cardErrors[f.key]}</p>}
                          </div>
                        ))}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input type="text" placeholder="MM/YY" value={cardForm.expiry}
                              onChange={e => setCardForm({ ...cardForm, expiry: formatExpiry(e.target.value) })}
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cardErrors.expiry ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }} />
                            {cardErrors.expiry && <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>{cardErrors.expiry}</p>}
                          </div>
                          <div className="flex-1">
                            <input type="text" placeholder="CVV" value={cardForm.cvv}
                              onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })}
                              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${cardErrors.cvv ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }} />
                            {cardErrors.cvv && <p className="text-[11px] mt-1" style={{ color: '#fca5a5' }}>{cardErrors.cvv}</p>}
                          </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={handlePay}
                          className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                          style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                          <FontAwesomeIcon icon={faLock} style={{ fontSize: 10 }} />
                          Payer {modalBilling === 'yearly' ? '180€' : '19€/mois'}
                        </motion.button>
                        <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                          <FontAwesomeIcon icon={faShieldHalved} className="mr-1" /> Paiement 100% simulé
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {modalStep === 'processing' && (
                    <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center text-center py-10">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="w-14 h-14 rounded-full mb-5"
                        style={{ border: '3px solid rgba(139,92,246,0.15)', borderTopColor: '#8b5cf6' }} />
                      <h3 className="font-bold text-white text-base mb-1">Traitement en cours...</h3>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Activation de votre abonnement</p>
                    </motion.div>
                  )}

                  {modalStep === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center py-8">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'white', fontSize: 28 }} />
                      </motion.div>
                      <h3 className="font-black text-white text-lg mb-1">Bienvenue dans Premium !</h3>
                      <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>Toutes les vidéos sont maintenant débloquées.</p>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={closePremiumModal}
                        className="px-6 py-2.5 rounded-xl font-bold text-white text-sm"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                        Continuer l'apprentissage
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoCallBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        course={course}
      />
    </LearnerLayout>
  );
};

export default WatchCoursePage;