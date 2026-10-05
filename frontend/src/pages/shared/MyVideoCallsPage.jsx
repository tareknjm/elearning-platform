import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVideo, faCalendarDays, faClock, faCircleCheck, faCircleXmark,
  faTriangleExclamation, faArrowRight, faUserGraduate, faChalkboardUser,
  faFileMedical, faEuroSign,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { getMyVideoCalls, getInstructorVideoCalls } from '../../services/videoCallService';

const JOIN_WINDOW_BEFORE_MIN = 10;

const DAY_LABELS = {
  MONDAY: 'Lundi', TUESDAY: 'Mardi', WEDNESDAY: 'Mercredi', THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi', SATURDAY: 'Samedi', SUNDAY: 'Dimanche',
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  const dow = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][date.getDay()];
  return {
    label: `${DAY_LABELS[dow]} ${date.getDate()} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`,
    time: `${String(date.getHours()).padStart(2,'0')}h${String(date.getMinutes()).padStart(2,'0')}`,
  };
};

const canJoinNow = (booking) => {
  if (booking.status !== 'CONFIRMED') return false;
  const start = new Date(booking.scheduledAt);
  const now = new Date();
  return now >= new Date(start.getTime() - JOIN_WINDOW_BEFORE_MIN * 60000)
      && now <= new Date(start.getTime() + booking.durationMinutes * 60000);
};

const isPast = (booking) =>
  Date.now() > new Date(booking.scheduledAt).getTime() + booking.durationMinutes * 60000;

const MyVideoCallsPage = () => {
  const { user } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const isInstructor = user?.role === 'INSTRUCTOR';
  const Layout = isInstructor ? InstructorLayout : LearnerLayout;

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  // ── Tokens
  const accent = isInstructor ? '#10b981' : '#6366f1';
  const t = {
    textPrimary:  dark ? '#ffffff'                : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.5)'  : '#6b7280',
    surface:      dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    surfaceSub:   dark ? 'rgba(255,255,255,0.02)' : '#f8f9fa',
    border:       dark ? 'rgba(255,255,255,0.08)' : '#ebebeb',
    shadow:       dark ? 'none'                   : '0 1px 12px rgba(0,0,0,0.05)',
    accent,
    accentBg:     dark ? `${accent}20`            : `${accent}10`,
    accentBorder: dark ? `${accent}40`            : `${accent}25`,
    accentText:   dark ? (isInstructor ? '#6ee7b7' : '#a5b4fc') : (isInstructor ? '#059669' : '#4f46e5'),
  };

  // Status config — adapté mode clair
  const STATUS_CONFIG = {
    CONFIRMED: {
      label: 'Confirmé', icon: faCircleCheck,
      color: dark ? '#818cf8' : '#4f46e5',
      bg: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)',
      border: dark ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.2)',
    },
    COMPLETED: {
      label: 'Terminé', icon: faCircleCheck,
      color: '#10b981',
      bg: dark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.08)',
      border: dark ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)',
    },
    CANCELLED: {
      label: 'Annulé', icon: faCircleXmark,
      color: t.textSub,
      bg: t.surfaceSub,
      border: t.border,
    },
    ABSENT: {
      label: 'Absence', icon: faTriangleExclamation,
      color: '#ef4444',
      bg: dark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.07)',
      border: dark ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.2)',
    },
  };

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCalls = async () => {
    try {
      const data = isInstructor ? await getInstructorVideoCalls() : await getMyVideoCalls();
      setCalls(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const upcomingCalls = calls.filter(c => !isPast(c) && c.status === 'CONFIRMED');
  const pastCalls     = calls.filter(c => isPast(c) || c.status !== 'CONFIRMED');
  const displayedCalls = filter === 'upcoming' ? upcomingCalls : pastCalls;

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-7 h-7 rounded-full"
          style={{ border: `2px solid ${t.accentBorder}`, borderTopColor: t.accent }} />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-[760px] mx-auto">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: t.accentBg, border: `1px solid ${t.accentBorder}` }}>
            <FontAwesomeIcon icon={faVideo} style={{ color: t.accent, fontSize: 16 }} />
          </div>
          <div>
            <h1 className="font-bold text-[18px] leading-tight" style={{ color: t.textPrimary }}>
              Mes appels vidéo
            </h1>
            <p className="text-[12px] mt-0.5" style={{ color: t.textSub }}>
              {isInstructor ? 'Vos sessions 1-on-1 avec les apprenants' : 'Vos sessions 1-on-1 réservées'}
            </p>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'upcoming', label: `À venir (${upcomingCalls.length})` },
            { key: 'past',     label: `Historique (${pastCalls.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
              style={filter === tab.key ? {
                background: t.accentBg,
                color: t.accentText,
                border: `1px solid ${t.accentBorder}`,
              } : {
                background: t.surface,
                color: t.textSub,
                border: `1px solid ${t.border}`,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Liste ── */}
        {displayedCalls.length === 0 ? (
          <div className="text-center py-16 rounded-2xl"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: t.accentBg }}>
              <FontAwesomeIcon icon={faCalendarDays} style={{ color: t.accent, fontSize: 18 }} />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: t.textPrimary }}>
              {filter === 'upcoming' ? 'Aucun appel à venir' : 'Aucun appel passé'}
            </p>
            <p className="text-[12px]" style={{ color: t.textSub }}>
              {filter === 'upcoming' ? 'Réservez une session avec un instructeur' : 'Votre historique apparaîtra ici'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayedCalls.map((booking, i) => {
              const { label, time } = formatDateTime(booking.scheduledAt);
              const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.CONFIRMED;
              const joinable = canJoinNow(booking);
              const otherParty = isInstructor ? booking.learner : booking.instructor;

              return (
                <motion.div key={booking.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
                  style={{
                    background: t.surface,
                    border: `1px solid ${t.border}`,
                    boxShadow: t.shadow,
                  }}>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                      <FontAwesomeIcon
                        icon={isInstructor ? faUserGraduate : faChalkboardUser}
                        style={{ color: statusCfg.color, fontSize: 14 }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: t.textPrimary }}>
                        {booking.course?.title}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: t.textSub }}>
                        Avec {otherParty?.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: t.textSub }}>
                          <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 9 }} />
                          {label}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: t.textSub }}>
                          <FontAwesomeIcon icon={faClock} style={{ fontSize: 9 }} />
                          {time} · {booking.durationMinutes}min
                        </span>
                        {!isInstructor && booking.amountPaid && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: t.textSub }}>
                            <FontAwesomeIcon icon={faEuroSign} style={{ fontSize: 9 }} />
                            {booking.amountPaid?.toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}>
                      <FontAwesomeIcon icon={statusCfg.icon} style={{ fontSize: 8 }} />
                      {statusCfg.label}
                    </span>

                    {booking.status === 'CONFIRMED' && !isPast(booking) && (
                      <motion.button
                        whileHover={joinable ? { scale: 1.03 } : {}}
                        whileTap={joinable ? { scale: 0.97 } : {}}
                        onClick={() => joinable && navigate(`/video-call/${booking.id}`)}
                        disabled={!joinable}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: joinable ? t.accent : t.surfaceSub,
                          color: joinable ? 'white' : t.textSub,
                          border: joinable ? 'none' : `1px solid ${t.border}`,
                        }}>
                        {joinable ? 'Rejoindre' : 'Bientôt'}
                        {joinable && <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 9 }} />}
                      </motion.button>
                    )}

                    {booking.status === 'ABSENT' && isInstructor && (
                      <button
                        onClick={() => navigate(`/instructor/absences?booking=${booking.id}`)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold"
                        style={{
                          background: 'rgba(245,158,11,0.1)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245,158,11,0.2)',
                        }}>
                        <FontAwesomeIcon icon={faFileMedical} style={{ fontSize: 10 }} />
                        Justifier
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyVideoCallsPage;