import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import { getCourseById } from '../../services/courseService';
import { getVideosByCourse } from '../../services/videoService';
import { enroll, isEnrolled } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import Layout from '../../components/Layout';
import api from '../../services/api';
import VideoCallBookingModal from '../../components/modals/VideoCallBookingModal';
import { resolveMediaUrl } from '../../utils/media';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');
  const [myStars, setMyStars] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratings, setRatings] = useState([]);

  const isLearner = user?.role === 'LEARNER';
  const Wrapper = isLearner ? LearnerLayout : Layout;

  // ── Tokens cohérents avec le reste de l'app
  const t = {
    textPrimary:  dark ? '#ffffff'                 : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.5)'   : '#6b7280',
    textBody:     dark ? 'rgba(255,255,255,0.65)'  : '#4b5563',
    surface:      dark ? 'rgba(255,255,255,0.05)'  : '#ffffff',
    surfaceSub:   dark ? 'rgba(255,255,255,0.04)'  : '#f9fafb',
    border:       dark ? 'rgba(255,255,255,0.08)'  : '#ebebeb',
    shadow:       dark ? 'none'                    : '0 2px 16px rgba(0,0,0,0.06)',
    accent:       '#8b5cf6',
    accentLight:  dark ? '#c4b5fd'                 : '#8b5cf6',
    accentBg:     dark ? 'rgba(139,92,246,0.12)'   : 'rgba(139,92,246,0.07)',
    accentBorder: dark ? 'rgba(139,92,246,0.25)'   : 'rgba(139,92,246,0.18)',
    starEmpty:    dark ? 'rgba(255,255,255,0.15)'  : '#e5e7eb',
    lockIcon:     dark ? 'rgba(255,255,255,0.2)'   : '#d1d5db',
    divider:      dark ? 'rgba(255,255,255,0.07)'  : '#f0f0f0',
    videoItem:    dark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
                       : { background: '#f9fafb', border: '1px solid #f0f0f0' },
    ratingItem:   dark ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
                       : { background: '#f9fafb', border: '1px solid #f0f0f0' },
    textareaStyle: dark ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)', color: '#ffffff' }
                        : { background: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827' },
    cardShadow:   dark ? '0 20px 50px rgba(139,92,246,0.15)' : '0 16px 40px rgba(0,0,0,0.08)',
  };

  const glassCard = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: '20px',
    boxShadow: t.shadow,
    ...(dark ? { backdropFilter: 'blur(16px)' } : {}),
  };

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const courseData = await getCourseById(id);
      setCourse(courseData);
      const videosData = await getVideosByCourse(id);
      setVideos(videosData);
      if (user?.role === 'LEARNER') {
        const enrolledStatus = await isEnrolled(id);
        setEnrolled(enrolledStatus);
        try {
          const ratingsRes = await api.get(`/courses/${id}/ratings`);
          setRatings(ratingsRes.data);
          const myRating = ratingsRes.data.find(r => r.userId === Number(localStorage.getItem('userId')));
          if (myRating) { setMyStars(myRating.stars); setMyComment(myRating.comment || ''); }
        } catch {}
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrollLoading(true); setError('');
    try { await enroll(id); setEnrolled(true); }
    catch (err) { setError(err.response?.data?.message || "Erreur lors de l'inscription"); }
    finally { setEnrollLoading(false); }
  };

  const handleRating = async () => {
    if (!myStars) return;
    setRatingLoading(true);
    try {
      await api.post(`/learner/courses/${id}/rate`, { stars: myStars, comment: myComment });
      setRatingSuccess('Merci pour votre avis !');
      setTimeout(() => setRatingSuccess(''), 3000);
      loadData();
    } catch (err) { console.error(err); }
    finally { setRatingLoading(false); }
  };

  if (loading) return (
    <Wrapper>
      <div className="flex items-center justify-center py-32">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full"
          style={{ border: `2px solid ${t.accentBorder}`, borderTopColor: t.accent }} />
      </div>
    </Wrapper>
  );

  if (!course) return (
    <Wrapper>
      <div className="text-center py-32 text-[14px]" style={{ color: t.textSub }}>Formation introuvable</div>
    </Wrapper>
  );

  return (
    <Wrapper>
      <div className="max-w-6xl mx-auto">

        {/* Retour */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 text-[13px] font-medium transition"
          style={{ color: t.accentLight }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour
        </motion.button>

        {/* ── En-tête texte ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="mb-5">
          <div className="flex gap-2 mb-3 flex-wrap">
            {course.categoryName && (
              <span className="text-[11px] px-3 py-1.5 rounded-full font-semibold"
                style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accentLight }}>
                {course.categoryName}
              </span>
            )}
            {course.level && (
              <span className="text-[11px] px-3 py-1.5 rounded-full font-medium"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', border: `1px solid ${t.border}`, color: t.textSub }}>
                {course.level}
              </span>
            )}
          </div>

          <h1 className="text-[2rem] md:text-[2.4rem] font-bold mb-3 leading-tight tracking-tight"
            style={{ color: t.textPrimary, letterSpacing: '-0.025em' }}>
            {course.title}
          </h1>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                style={{ background: `linear-gradient(135deg, ${t.accent}, #6366f1)` }}>
                {course.instructorName?.charAt(0)}
              </div>
              <p className="text-[13px] font-medium" style={{ color: t.textSub }}>
                Par <span className="font-semibold" style={{ color: t.accentLight }}>{course.instructorName}</span>
              </p>
            </div>

            {course.totalRatings > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-[13px]"
                      style={{ color: s <= Math.round(course.averageRating) ? '#f59e0b' : t.starEmpty }}>★</span>
                  ))}
                </div>
                <span className="font-bold text-[13px]" style={{ color: '#f59e0b' }}>{course.averageRating}</span>
                <span className="text-[11px]" style={{ color: t.textSub }}>({course.totalRatings} avis)</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Hero image ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{ height: '300px', boxShadow: t.cardShadow }}>
          {course.imageUrl ? (
            <img src={resolveMediaUrl(course.imageUrl)} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${t.accent}, #6366f1)` }} />
          )}
        </motion.div>

        {/* ── Layout 2 colonnes ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }} style={glassCard} className="p-6">
              <h2 className="font-semibold text-[15px] mb-3" style={{ color: t.textPrimary }}>
                À propos de cette formation
              </h2>
              <p className="leading-relaxed text-[13px]" style={{ color: t.textBody }}>
                {course.description}
              </p>
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5" style={{ borderTop: `1px solid ${t.divider}` }}>
                {[
                  { label: 'Vidéos', value: videos.length, color: t.accent },
                  { label: 'Note', value: course.averageRating || '—', color: '#f59e0b' },
                  { label: 'Avis', value: course.totalRatings || 0, color: '#10b981' },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-[22px] font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: t.textSub }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Liste vidéos */}
            {videos.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }} style={glassCard} className="p-6">
                <h2 className="font-semibold text-[15px] mb-4" style={{ color: t.textPrimary }}>
                  Contenu du cours
                  <span className="ml-2 text-[12px] font-normal" style={{ color: t.textSub }}>
                    ({videos.length} vidéo{videos.length > 1 ? 's' : ''})
                  </span>
                </h2>
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <motion.div key={video.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={t.videoItem}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accentLight }}>
                        {index + 1}
                      </div>
                      <span className="text-[13px] flex-1" style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#374151' }}>
                        {video.title}
                      </span>
                      {!enrolled && (
                        <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0"
                          stroke={t.lockIcon} strokeWidth="2">
                          <rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
                        </svg>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Notation */}
            {user?.role === 'LEARNER' && enrolled && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }} style={glassCard} className="p-6">
                <h2 className="font-semibold text-[15px] mb-5" style={{ color: t.textPrimary }}>Votre avis</h2>

                {ratingSuccess && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl mb-4 text-[13px] flex items-center gap-2"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {ratingSuccess}
                  </motion.div>
                )}

                <div className="mb-4">
                  <p className="text-[11px] font-bold mb-2 uppercase tracking-widest" style={{ color: t.textSub }}>Note</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <motion.button key={star}
                        whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                        onClick={() => setMyStars(star)}
                        className="text-3xl transition-all duration-150"
                        style={{ color: star <= myStars ? '#f59e0b' : t.starEmpty,
                                 filter: star <= myStars ? 'drop-shadow(0 0 5px rgba(245,158,11,0.45))' : 'none' }}>
                        ★
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[11px] font-bold mb-2 uppercase tracking-widest" style={{ color: t.textSub }}>
                    Commentaire (optionnel)
                  </p>
                  <textarea value={myComment} onChange={e => setMyComment(e.target.value)}
                    rows={3} placeholder="Partagez votre expérience..."
                    className="w-full text-[13px] outline-none rounded-xl px-4 py-3 resize-none"
                    style={t.textareaStyle} />
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={!myStars || ratingLoading} onClick={handleRating}
                  className="w-full py-3 rounded-xl font-semibold text-white text-[13px] disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, #6366f1)`,
                           boxShadow: myStars ? '0 4px 15px rgba(139,92,246,0.3)' : 'none' }}>
                  {ratingLoading ? 'Envoi...' : 'Soumettre mon avis'}
                </motion.button>
              </motion.div>
            )}

            {/* Avis des autres */}
            {ratings.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }} style={glassCard} className="p-6">
                <h2 className="font-semibold text-[15px] mb-4" style={{ color: t.textPrimary }}>
                  Avis des apprenants
                  <span className="ml-2 text-[12px] font-normal" style={{ color: t.textSub }}>({ratings.length})</span>
                </h2>
                <div className="space-y-3">
                  {ratings.map((rating, i) => (
                    <motion.div key={rating.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-4 rounded-xl"
                      style={t.ratingItem}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, ${t.accent}, #6366f1)` }}>
                          {rating.userName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: t.textPrimary }}>{rating.userName}</p>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className="text-[11px]"
                                style={{ color: s <= rating.stars ? '#f59e0b' : t.starEmpty }}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {rating.comment && (
                        <p className="text-[12px] ml-11" style={{ color: t.textBody }}>{rating.comment}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Sidebar CTA ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:sticky lg:top-6">
            <div style={glassCard} className="p-6 overflow-hidden">

              {/* Mini photo */}
              <div className="relative -mx-6 -mt-6 mb-5 h-36 overflow-hidden">
                {course.imageUrl ? (
                  <img src={resolveMediaUrl(course.imageUrl)} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${t.accent}, #6366f1)` }} />
                )}
              </div>

              {/* Erreur limite */}
              {error === 'LIMIT_REACHED' ? (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl mb-4"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.15)' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="#f59e0b" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[11px] mb-1" style={{ color: '#f59e0b' }}>Limite atteinte</p>
                      <p className="text-[11px] mb-3" style={{ color: dark ? 'rgba(255,255,255,0.6)' : '#92400e' }}>
                        3 formations max en gratuit. Passez Premium pour un accès illimité.
                      </p>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/pricing')}
                        className="w-full px-4 py-2 rounded-lg text-[11px] font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                        ⚡ Passer Premium
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl mb-4 text-[11px] flex items-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </motion.div>
              )}

              {/* CTA boutons */}
              {!user && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-[13px] mb-4"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, #6366f1)`, boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}>
                  Se connecter pour s'inscrire
                </motion.button>
              )}

              {user?.role === 'LEARNER' && !enrolled && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={enrollLoading} onClick={handleEnroll}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-[13px] mb-4 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, #6366f1)`, boxShadow: '0 4px 20px rgba(139,92,246,0.3)' }}>
                  {enrollLoading ? 'Inscription...' : "S'inscrire gratuitement"}
                </motion.button>
              )}

              {user?.role === 'LEARNER' && enrolled && (
                <div className="space-y-3 mb-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 flex-shrink-0" stroke="#10b981" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="font-semibold text-[12px]" style={{ color: '#10b981' }}>Inscrit à cette formation</span>
                  </motion.div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/learner/courses/${id}/watch`)}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-[13px] flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                    Accéder aux vidéos
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowBookingModal(true)}
                    className="w-full py-3.5 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2"
                    style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accentLight }}>
                    <FontAwesomeIcon icon={faVideo} style={{ fontSize: 11 }} />
                    Réserver un appel 1-on-1
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                      Premium
                    </span>
                  </motion.button>
                </div>
              )}

              {user?.role === 'INSTRUCTOR' && (
                <div className="p-4 rounded-xl text-center text-[12px] mb-4"
                  style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}`, color: t.accentLight }}>
                  Connectez-vous en tant qu'apprenant pour vous inscrire
                </div>
              )}

              {/* Mini-récap */}
              <div className="space-y-2.5 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
                {[
                  { icon: '🎬', label: `${videos.length} vidéo${videos.length > 1 ? 's' : ''}` },
                  { icon: '♾️', label: 'Accès à vie' },
                  { icon: '📱', label: 'Sur tous vos appareils' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5 text-[12px]" style={{ color: t.textSub }}>
                    <span>{item.icon}</span>{item.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <VideoCallBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        course={course}
      />
    </Wrapper>
  );
};

export default CourseDetailPage;