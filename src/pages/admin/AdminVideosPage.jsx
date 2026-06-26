import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layouts/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { getAllVideos, approveVideo, rejectVideo, archiveVideo, restoreVideo } from '../../services/videoService';

const AdminVideosPage = () => {
  const { dark } = useTheme();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('PENDING');
  const [courseFilter, setCourseFilter] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  const API_BASE = 'http://localhost:8080';
  const bg = dark ? '#0d0d1a' : '#ffffff';
  const cardBorder = dark ? 'rgba(99,102,241,0.12)' : '#e5e7eb';
  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.45)' : '#6b7280';
  const accent = '#6366f1';
  const accentLight = dark ? '#a5b4fc' : '#4338ca';

  useEffect(() => { loadVideos(); setCourseFilter(null); }, [view]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await getAllVideos(view === 'ARCHIVE');
      setVideos(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    await approveVideo(id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleReject = async (id) => {
    await rejectVideo(id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleArchive = async (id) => {
    await archiveVideo(id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleRestore = async (id) => {
    await restoreVideo(id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const visibleVideos = (() => {
    if (view === 'PENDING') return videos.filter(v => v.status === 'PENDING');
    if (view === 'HISTORY') return videos.filter(v => v.status !== 'PENDING');
    return videos;
  })();

  // Groupement par formation pour l'historique
  const grouped = (() => {
    let list = visibleVideos;
    if (courseFilter) list = list.filter(v => v.courseTitle === courseFilter);
    const map = {};
    list.forEach(v => {
      const key = v.courseTitle || 'Sans formation';
      if (!map[key]) map[key] = [];
      map[key].push(v);
    });
    return map;
  })();

  const historyCourses = [...new Set(visibleVideos.map(v => v.courseTitle || 'Sans formation'))];

  const statusConfig = {
    PENDING:  { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  color: '#fcd34d', label: 'En attente' },
    APPROVED: { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  color: '#6ee7b7', label: 'Approuvée' },
    REJECTED: { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)',   color: '#fca5a5', label: 'Refusée' },
  };

  const views = [
    { key: 'PENDING', label: 'En attente', count: videos.filter(v => !v.archived && v.status === 'PENDING').length },
    { key: 'HISTORY', label: 'Historique', count: videos.filter(v => !v.archived && v.status !== 'PENDING').length },
    { key: 'ARCHIVE', label: 'Archives', count: null },
  ];

  // Carte vidéo partagée
  const VideoCard = ({ video }) => {
    const sc = statusConfig[video.status] || statusConfig.PENDING;
    const isPlaying = playingVideo === video.id;
    return (
      <motion.div layout
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: bg, border: `1px solid ${cardBorder}` }}>

        {/* Lecteur vidéo — visible au clic */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden">
              <video controls controlsList="nodownload" autoPlay
                className="w-full" style={{ maxHeight: '240px', background: '#000' }} preload="metadata">
                <source src={`${API_BASE}${video.url}`} type="video/mp4" />
              </video>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Infos + actions */}
        <div className="flex items-center gap-4 p-4">
          {/* Bouton play */}
          <button onClick={() => setPlayingVideo(isPlaying ? null : video.id)}
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition"
            style={{ background: isPlaying ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.1)', border: `1px solid rgba(99,102,241,0.2)` }}>
            {isPlaying
              ? <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={accentLight} strokeWidth="2.5">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              : <svg viewBox="0 0 24 24" fill={accentLight} className="w-5 h-5">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
            }
          </button>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: textPrimary }}>{video.title}</p>
            <p className="text-xs mt-0.5" style={{ color: textSub }}>{video.courseTitle}</p>
            <div className="mt-1.5">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1"
                style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
                {sc.label}
              </span>
            </div>
          </div>

          {/* Date archivage */}
          {view === 'ARCHIVE' && video.archivedAt && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs" style={{ color: textSub }}>Archivée le</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: accentLight }}>
                {new Date(video.archivedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            {view === 'PENDING' && (
              <>
                <motion.button whileHover={{ scale: 1.05 }}
                  onClick={() => handleApprove(video.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Approuver
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }}
                  onClick={() => handleReject(video.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Refuser
                </motion.button>
              </>
            )}
            {view === 'HISTORY' && (
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleArchive(video.id)}
                title="Archiver"
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: textSub }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </motion.button>
            )}
            {view === 'ARCHIVE' && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleRestore(video.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: accentLight }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
                Restaurer
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Vidéos</h1>
        <p className="text-sm mt-1" style={{ color: accent }}>
          {view === 'PENDING' && `${visibleVideos.length} vidéo(s) en attente de validation`}
          {view === 'HISTORY' && `${visibleVideos.length} vidéo(s) traitée(s)`}
          {view === 'ARCHIVE' && `${visibleVideos.length} vidéo(s) archivée(s)`}
        </p>
      </div>

      {/* Toggle 3 vues */}
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
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: bg, border: `1px solid ${cardBorder}` }} />
          ))}
        </div>

      ) : view === 'PENDING' ? (
        visibleVideos.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: bg, border: `1px solid ${cardBorder}` }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 mx-auto mb-3 opacity-20" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p className="font-semibold" style={{ color: textPrimary }}>Tout est traité !</p>
            <p className="text-sm mt-1" style={{ color: textSub }}>Aucune vidéo en attente de validation</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {visibleVideos.map(video => <VideoCard key={video.id} video={video} />)}
            </AnimatePresence>
          </div>
        )

      ) : view === 'HISTORY' ? (
        <>
          {/* Filtre par formation */}
          {historyCourses.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => setCourseFilter(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
                style={!courseFilter ? {
                  background: `linear-gradient(135deg,${accent},#4f46e5)`, color: 'white',
                } : { background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6', color: textSub, border: `1px solid ${cardBorder}` }}>
                Toutes
              </button>
              {historyCourses.map(name => (
                <button key={name} onClick={() => setCourseFilter(name === courseFilter ? null : name)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
                  style={courseFilter === name ? {
                    background: `linear-gradient(135deg,${accent},#4f46e5)`, color: 'white',
                  } : { background: dark ? 'rgba(99,102,241,0.08)' : '#f3f4f6', color: textSub, border: `1px solid ${cardBorder}` }}>
                  {name}
                </button>
              ))}
            </div>
          )}

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-20 rounded-2xl" style={{ background: bg, border: `1px solid ${cardBorder}` }}>
              <p style={{ color: textSub }}>Aucune vidéo traitée pour le moment</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([courseName, courseVideos]) => (
                <motion.div key={courseName} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1" style={{ background: dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb' }} />
                    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ background: dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)', color: accentLight, border: `1px solid rgba(99,102,241,0.2)` }}>
                      {courseName}
                      <span className="ml-2 opacity-60">{courseVideos.length}</span>
                    </span>
                    <div className="h-px flex-1" style={{ background: dark ? 'rgba(99,102,241,0.15)' : '#e5e7eb' }} />
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {courseVideos.map(video => <VideoCard key={video.id} video={video} />)}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>

      ) : (
        visibleVideos.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: bg, border: `1px solid ${cardBorder}` }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 mx-auto mb-3 opacity-20" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 8v13H3V8"/><path d="M23 3H1v5h22V3z"/><line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <p className="font-semibold" style={{ color: textPrimary }}>Aucune vidéo archivée</p>
            <p className="text-sm mt-1" style={{ color: textSub }}>Les vidéos archivées depuis l'historique apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {visibleVideos.map(video => <VideoCard key={video.id} video={video} />)}
            </AnimatePresence>
          </div>
        )
      )}
    </AdminLayout>
  );
};

export default AdminVideosPage;