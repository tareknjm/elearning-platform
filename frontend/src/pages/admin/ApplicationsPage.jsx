import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import {
  getAllApplications, scheduleInterview,
  reviewApplication, archiveApplication, restoreApplication
} from '../../services/applicationService';

const JITSI_BASE = 'https://meet.jit.si/';

const getMotivationUrl = (path) => {
  if (!path) return null;
  return 'http://localhost:8080/' + path.split('\\').join('/');
};

const ApplicationsPage = () => {
  const { dark } = useTheme();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('PENDING');

  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({ adminNote: '', temporaryPassword: 'Instructor@2026' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [jitsiApp, setJitsiApp] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const cardBg = dark ? '#0d0d1a' : '#ffffff';
  const cardBorder = dark ? 'rgba(99,102,241,0.12)' : '#e5e7eb';
  const accent = '#6366f1';
  const accentLight = dark ? '#a5b4fc' : '#4338ca';

  const inputStyle = {
    background: dark ? 'rgba(99,102,241,0.05)' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(99,102,241,0.2)' : '#e5e7eb'}`,
    borderRadius: '12px', color: textPrimary,
    width: '100%', padding: '10px 16px',
    fontSize: '14px', outline: 'none',
  };

  useEffect(() => { loadApplications(); }, [view]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      setApplications(await getAllApplications(view === 'ARCHIVE'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const flash = (msg, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const visibleApps = (() => {
    if (view === 'PENDING') return applications.filter(a => a.status === 'PENDING');
    if (view === 'INTERVIEW') return applications.filter(a => a.status === 'INTERVIEW_SCHEDULED');
    if (view === 'HISTORY') return applications.filter(a => ['APPROVED','REJECTED'].includes(a.status));
    return applications;
  })();

  const views = [
    { key: 'PENDING',   label: 'En attente',  count: applications.filter(a => a.status === 'PENDING').length },
    { key: 'INTERVIEW', label: 'Entretiens',   count: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length },
    { key: 'HISTORY',   label: 'Historique',   count: applications.filter(a => ['APPROVED','REJECTED'].includes(a.status)).length },
    { key: 'ARCHIVE',   label: 'Archives',     count: null },
  ];

  const statusConfig = {
    PENDING: { label: 'En attente', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#fcd34d' },
    INTERVIEW_SCHEDULED: { label: 'Entretien planifié', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', color: '#a5b4fc' },
    APPROVED: { label: 'Approuvée', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#6ee7b7' },
    REJECTED: { label: 'Refusée', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', color: '#fca5a5' },
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) { flash('Choisissez une date et une heure', true); return; }
    setScheduleLoading(true);
    try {
      const dt = `${scheduleDate}T${scheduleTime}:00`;
      const updated = await scheduleInterview(scheduleTarget.id, dt);
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      setScheduleTarget(null);
      flash(`Entretien planifié — email envoyé à ${updated.email}`);
    } catch { flash('Erreur lors de la planification', true); }
    finally { setScheduleLoading(false); }
  };

  const handleReview = async (decision) => {
    setReviewLoading(true);
    try {
      const updated = await reviewApplication(selected.id, { ...reviewForm, decision });
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      setSelected(null);
      flash(decision === 'APPROVE'
        ? `Candidature approuvée — compte créé pour ${updated.fullName}`
        : 'Candidature refusée');
    } catch { flash('Erreur lors du traitement', true); }
    finally { setReviewLoading(false); }
  };

  const handleArchive = async (id) => {
    await archiveApplication(id);
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  const handleRestore = async (id) => {
    await restoreApplication(id);
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  const AppCard = ({ app }) => {
    const sc = statusConfig[app.status] || statusConfig.PENDING;
    return (
      <motion.div layout
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {app.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: textPrimary }}>{app.fullName}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: textSub }}>
              {app.email} · {app.speciality} · {app.experience}
            </p>
            {app.status === 'INTERVIEW_SCHEDULED' && app.interviewScheduledAt && (
              <p className="text-xs mt-1 font-medium" style={{ color: accentLight }}>
                📅 {new Date(app.interviewScheduledAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            )}
            {view === 'ARCHIVE' && app.archivedAt && (
              <p className="text-xs mt-1" style={{ color: textSub }}>
                Archivée le {new Date(app.archivedAt).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
            {sc.label}
          </span>

          {view === 'PENDING' && (
            <>
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={() => { setScheduleTarget(app); setScheduleDate(''); setScheduleTime(''); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: accentLight }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Planifier
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={() => { setSelected(app); setReviewForm({ adminNote: '', temporaryPassword: 'Instructor@2026' }); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: textSub }}>
                Voir
              </motion.button>
            </>
          )}

          {view === 'INTERVIEW' && (
            <>
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={() => setJitsiApp(app)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
                Rejoindre
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={() => { setSelected(app); setReviewForm({ adminNote: '', temporaryPassword: 'Instructor@2026' }); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 text-white"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Décider
              </motion.button>
            </>
          )}

          {view === 'HISTORY' && (
            <>
              <motion.button whileHover={{ scale: 1.05 }}
                onClick={() => { setSelected(app); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: textSub }}>
                Voir
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleArchive(app.id)}
                title="Archiver"
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: textSub }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </motion.button>
            </>
          )}

          {view === 'ARCHIVE' && (
            <motion.button whileHover={{ scale: 1.05 }}
              onClick={() => handleRestore(app.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: accentLight }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Restaurer
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Candidatures Instructeurs</h1>
        <p className="text-sm mt-1" style={{ color: accent }}>
          {view === 'PENDING' && `${visibleApps.length} candidature(s) en attente`}
          {view === 'INTERVIEW' && `${visibleApps.length} entretien(s) planifié(s)`}
          {view === 'HISTORY' && `${visibleApps.length} candidature(s) traitée(s)`}
          {view === 'ARCHIVE' && `${visibleApps.length} candidature(s) archivée(s)`}
        </p>
      </div>

      <AnimatePresence>
        {(success || error) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl mb-5 text-sm flex items-center gap-2"
            style={success ? {
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7',
            } : {
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5',
            }}>
            {success || error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex rounded-2xl p-1 gap-1 mb-8 w-fit"
        style={{ background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6', border: `1px solid ${cardBorder}` }}>
        {views.map(v => (
          <button key={v.key} onClick={() => setView(v.key)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            style={view === v.key ? {
              background: `linear-gradient(135deg,${accent},#4f46e5)`,
              color: 'white', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            } : { color: textSub }}>
            {v.label}
            {v.count !== null && (
              <span className="px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: view === v.key ? 'rgba(255,255,255,0.2)' : 'rgba(99,102,241,0.15)', color: view === v.key ? 'white' : accentLight }}>
                {v.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: cardBg, border: `1px solid ${cardBorder}` }} />
          ))}
        </div>
      ) : visibleApps.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 mx-auto mb-3 opacity-20" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="2" width="8" height="4" rx="1"/>
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
          </svg>
          <p className="font-semibold" style={{ color: textPrimary }}>
            {view === 'PENDING' && 'Aucune candidature en attente'}
            {view === 'INTERVIEW' && 'Aucun entretien planifié'}
            {view === 'HISTORY' && 'Aucune candidature traitée'}
            {view === 'ARCHIVE' && 'Aucune candidature archivée'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleApps.map(app => <AppCard key={app.id} app={app} />)}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL PLANIFICATION ENTRETIEN */}
      <AnimatePresence>
        {scheduleTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setScheduleTarget(null)}>
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-7"
              style={{ background: dark ? '#0d0d1a' : '#fff', border: `1px solid ${cardBorder}` }}>

              <div className="h-0.5 rounded-full mb-6 -mt-1"
                style={{ background: `linear-gradient(to right,${accent},#4f46e5)` }} />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {scheduleTarget.fullName?.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold" style={{ color: textPrimary }}>Planifier un entretien</h2>
                  <p className="text-sm" style={{ color: textSub }}>{scheduleTarget.fullName} · {scheduleTarget.speciality}</p>
                </div>
                <button onClick={() => setScheduleTarget(null)} className="ml-auto" style={{ color: textSub }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: accentLight }}>
                    Date de l'entretien
                  </label>
                  <input type="date" value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: accentLight }}>
                    Heure
                  </label>
                  <input type="time" value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                    style={inputStyle} />
                </div>
                {scheduleDate && scheduleTime && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: accentLight }}>📅 Récapitulatif</p>
                    <p className="text-sm font-bold" style={{ color: textPrimary }}>
                      {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                    <p className="text-xs mt-1" style={{ color: textSub }}>
                      Un email avec le lien Jitsi sera envoyé automatiquement à <strong>{scheduleTarget.email}</strong>
                    </p>
                  </motion.div>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                disabled={scheduleLoading || !scheduleDate || !scheduleTime}
                onClick={handleSchedule}
                className="w-full py-3.5 rounded-2xl font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg,${accent},#4f46e5)`, boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {scheduleLoading ? 'Envoi en cours...' : "Confirmer & Envoyer l'email"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL JITSI */}
      <AnimatePresence>
        {jitsiApp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(0,0,0,0.95)' }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ background: dark ? '#0d0d1a' : '#fff', borderBottom: `1px solid ${cardBorder}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {jitsiApp.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: textPrimary }}>{jitsiApp.fullName}</p>
                  <p className="text-xs" style={{ color: textSub }}>Entretien en cours · {jitsiApp.speciality}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button whileHover={{ scale: 1.03 }}
                  onClick={() => {
                    setSelected(jitsiApp);
                    setReviewForm({ adminNote: '', temporaryPassword: 'Instructor@2026' });
                    setJitsiApp(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Prendre une décision
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }}
                  onClick={() => setJitsiApp(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  Quitter l'appel
                </motion.button>
              </div>
            </div>
            <div className="flex-1">
              <iframe
                src={`${JITSI_BASE}${jitsiApp.meetingRoom}#userInfo.displayName="Admin E-Learn"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`}
                allow="camera; microphone; fullscreen; display-capture"
                className="w-full h-full border-0"
                title="Entretien vidéo"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETAIL / DECISION */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
            onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl p-7 max-h-[85vh] overflow-y-auto"
              style={{ background: dark ? '#0d0d1a' : '#fff', border: `1px solid ${cardBorder}` }}>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {selected.fullName?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-lg" style={{ color: textPrimary }}>{selected.fullName}</h2>
                  <p className="text-sm" style={{ color: accentLight }}>{selected.speciality}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ color: textSub }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Email', value: selected.email },
                  { label: 'Téléphone', value: selected.phone },
                  { label: 'Niveau', value: selected.educationLevel },
                  { label: 'Expérience', value: selected.experience },
                ].map(item => (
                  <div key={item.label} className="rounded-xl p-3"
                    style={{ background: dark ? 'rgba(99,102,241,0.05)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(99,102,241,0.1)' : '#e5e7eb'}` }}>
                    <p className="text-xs mb-0.5 font-semibold" style={{ color: accent }}>{item.label}</p>
                    <p className="text-sm font-medium" style={{ color: textPrimary }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {selected.linkedinUrl && (
                <div className="mb-4">
                  <p className="text-xs mb-1 font-semibold" style={{ color: accentLight }}>LinkedIn</p>
                  <a href={selected.linkedinUrl} target="_blank" rel="noreferrer"
                    className="text-sm" style={{ color: '#818cf8' }}>{selected.linkedinUrl}</a>
                </div>
              )}

              <div className="rounded-xl p-4 mb-5"
                style={{ background: dark ? 'rgba(99,102,241,0.05)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(99,102,241,0.1)' : '#e5e7eb'}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: accentLight }}>Lettre de motivation</p>
                {selected.motivation && (
                  <p className="text-sm leading-relaxed mb-3" style={{ color: textSub }}>{selected.motivation}</p>
                )}
                {getMotivationUrl(selected.motivationFilePath) ? (
                  <a
                    href={getMotivationUrl(selected.motivationFilePath)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: accentLight }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Voir le fichier joint
                  </a>
                ) : (
                  <p className="text-xs" style={{ color: textSub, opacity: 0.5 }}>Aucun fichier joint</p>
                )}
              </div>

              {['PENDING', 'INTERVIEW_SCHEDULED'].includes(selected.status) && (
                <div>
                  <p className="text-sm font-semibold mb-3" style={{ color: textPrimary }}>Décision finale</p>
                  <div className="space-y-3 mb-5">
                    <div>
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: accentLight }}>Note admin (optionnel)</label>
                      <textarea value={reviewForm.adminNote}
                        onChange={e => setReviewForm({ ...reviewForm, adminNote: e.target.value })}
                        rows={2} style={inputStyle} className="resize-none"
                        placeholder="Raison de la décision..." />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1.5" style={{ color: accentLight }}>Mot de passe temporaire (si approuvé)</label>
                      <input type="text" value={reviewForm.temporaryPassword}
                        onChange={e => setReviewForm({ ...reviewForm, temporaryPassword: e.target.value })}
                        style={inputStyle} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      disabled={reviewLoading} onClick={() => handleReview('APPROVE')}
                      className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {reviewLoading ? 'Traitement...' : 'Approuver & Créer le compte'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      disabled={reviewLoading} onClick={() => handleReview('REJECT')}
                      className="flex-1 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      {reviewLoading ? '...' : 'Refuser'}
                    </motion.button>
                  </div>
                </div>
              )}

              {['APPROVED', 'REJECTED'].includes(selected.status) && (
                <div className="rounded-xl p-4"
                  style={{
                    background: selected.status === 'APPROVED' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${selected.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  }}>
                  <p className="text-sm font-bold flex items-center gap-2"
                    style={{ color: selected.status === 'APPROVED' ? '#6ee7b7' : '#fca5a5' }}>
                    {selected.status === 'APPROVED' ? '✓ Candidature approuvée' : '✗ Candidature refusée'}
                  </p>
                  {selected.adminNote && (
                    <p className="text-xs mt-2" style={{ color: textSub }}>Note : {selected.adminNote}</p>
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