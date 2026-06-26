import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { useTheme } from '../../context/ThemeContext';
import { uploadVideo, getVideosByCourse, deleteVideo } from '../../services/videoService';
import { getCourseById } from '../../services/courseService';

const Icons = {
  back: <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  warn: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  video: <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  upload: <svg viewBox="0 0 24 24" fill="none" className="w-9 h-9" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  arrowUp: <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  note: <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 flex-shrink-0" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
};

const UploadVideoPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();
  const fileInputRef = useRef(null);

  const [course, setCourse]     = useState(null);
  const [videos, setVideos]     = useState([]);
  const [form, setForm]         = useState({ title: '', orderIndex: 1 });
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const textPrimary = dark ? '#ffffff' : '#111827';
  const textSub = dark ? 'rgba(255,255,255,0.4)' : '#6b7280';
  const cardBg = dark ? '#0d1a14' : '#ffffff';
  const cardBorder = dark ? 'rgba(16,185,129,0.15)' : '#d1fae5';
  const accentLight = dark ? '#6ee7b7' : '#059669';
  const labelColor = dark ? 'rgba(16,185,129,0.7)' : '#059669';
  const innerBg = dark ? 'rgba(255,255,255,0.03)' : '#f9fafb';
  const innerBorder = dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';

  const cardStyle = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '20px',
    boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
  };
  const inputStyle = {
    background: dark ? 'rgba(16,185,129,0.06)' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(16,185,129,0.2)' : '#d1fae5'}`,
    borderRadius: '12px',
    color: textPrimary,
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };
  const labelStyle = {
    color: labelColor,
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  };

  useEffect(() => { loadData(); }, [courseId]);

  const loadData = async () => {
    try {
      const [courseData, videosData] = await Promise.all([
        getCourseById(courseId),
        getVideosByCourse(courseId),
      ]);
      setCourse(courseData);
      setVideos(videosData);
    } catch (err) { console.error(err); }
  };

  const handleDrop = e => {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('video/')) setFile(dropped);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) { setError('Veuillez sélectionner un fichier vidéo'); return; }
    setLoading(true); setError(''); setSuccess(''); setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => { if (p >= 90) { clearInterval(interval); return 90; } return p + 10; });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', form.title);
      formData.append('orderIndex', form.orderIndex);
      formData.append('file', file);
      const newVideo = await uploadVideo(formData);
      clearInterval(interval); setProgress(100);
      setVideos([...videos, newVideo]);
      setForm({ title: '', orderIndex: videos.length + 2 });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess('Vidéo uploadée avec succès !');
      setTimeout(() => { setSuccess(''); setProgress(0); }, 3000);
    } catch {
      clearInterval(interval); setProgress(0);
      setError("Erreur lors de l'upload");
    } finally { setLoading(false); }
  };

  const handleDelete = async videoId => {
    if (!confirm('Supprimer cette vidéo ?')) return;
    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err) { console.error(err); }
  };

  return (
    <InstructorLayout>
      <style>{`
        .uv-input:focus {
          border-color: rgba(16,185,129,0.55) !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .uv-input::placeholder { color: ${dark ? 'rgba(255,255,255,0.22)' : '#9ca3af'}; }
      `}</style>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => navigate('/instructor/dashboard')}
          className="flex items-center gap-2 text-sm mb-3 transition"
          style={{ color: labelColor }}
          onMouseEnter={e => e.currentTarget.style.color = accentLight}
          onMouseLeave={e => e.currentTarget.style.color = labelColor}>
          {Icons.back} Retour aux formations
        </button>
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Gérer les vidéos</h1>
        {course && (
          <p className="text-sm mt-1" style={{ color: textSub }}>
            Formation : <span style={{ color: accentLight, fontWeight: 600 }}>{course.title}</span>
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Formulaire upload */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }} style={cardStyle} className="p-6">

          <div className="h-0.5 rounded-full mb-5 -mt-1"
            style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />

          <h2 className="font-bold text-lg mb-5" style={{ color: textPrimary }}>Ajouter une vidéo</h2>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                {Icons.warn} {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: accentLight }}>
                {Icons.check} {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label style={labelStyle}>Titre de la vidéo</label>
              <input type="text" value={form.title} required
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="uv-input" style={inputStyle}
                placeholder="Ex: Introduction au cours" />
            </div>

            <div>
              <label style={labelStyle}>Ordre</label>
              <input type="number" value={form.orderIndex} min="1"
                onChange={e => setForm({ ...form, orderIndex: Number(e.target.value) })}
                className="uv-input" style={inputStyle} />
            </div>

            {/* Zone drag & drop */}
            <div>
              <label style={labelStyle}>Fichier vidéo</label>
              <motion.div
                whileHover={{ borderColor: 'rgba(16,185,129,0.5)' }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl p-8 text-center cursor-pointer transition-all duration-200"
                style={{
                  background: dragOver ? 'rgba(16,185,129,0.1)' : (dark ? 'rgba(16,185,129,0.04)' : '#f9fafb'),
                  border: `2px dashed ${dragOver ? 'rgba(16,185,129,0.5)' : file ? 'rgba(16,185,129,0.35)' : (dark ? 'rgba(16,185,129,0.15)' : '#d1fae5')}`,
                  borderRadius: '16px',
                }}>
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                  onChange={e => setFile(e.target.files[0])} />

                {file ? (
                  <div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex justify-center mb-2" style={{ color: accentLight }}>{Icons.video}</motion.div>
                    <p className="text-sm font-semibold" style={{ color: accentLight }}>{file.name}</p>
                    <p className="text-xs mt-1" style={{ color: textSub }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="mt-2 text-xs px-3 py-1 rounded-full transition"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}>
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-center mb-3" style={{ color: textSub, opacity: 0.6 }}>{Icons.upload}</div>
                    <p className="text-sm font-medium" style={{ color: textSub }}>
                      Glissez votre vidéo ici
                    </p>
                    <p className="text-xs mt-1" style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9ca3af' }}>
                      ou cliquez pour parcourir
                    </p>
                    <p className="text-xs mt-2 px-3 py-1 rounded-full inline-block"
                      style={{ background: 'rgba(16,185,129,0.08)', color: labelColor, border: '1px solid rgba(16,185,129,0.15)' }}>
                      MP4, MOV, AVI — max 100 MB
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Barre de progression */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: textSub }}>
                    <span>Upload en cours...</span>
                    <span style={{ color: accentLight }}>{progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
                    <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #10b981, #6ee7b7)' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton upload */}
            <motion.button type="submit" disabled={loading || !file}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-4 rounded-2xl font-bold text-white text-sm disabled:opacity-40 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: file && !loading ? '0 4px 20px rgba(16,185,129,0.35)' : 'none',
              }}>
              {loading ? `Upload ${progress}%` : <>{Icons.arrowUp} Uploader la vidéo</>}
            </motion.button>
          </form>
        </motion.div>

        {/* Liste + rappel quiz */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }} className="flex flex-col gap-5">

          {/* Liste vidéos */}
          <div style={cardStyle} className="p-6 flex-1">
            <div className="h-0.5 rounded-full mb-5 -mt-1"
              style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />

            <h2 className="font-bold text-lg mb-5" style={{ color: textPrimary }}>
              Vidéos
              <span className="ml-2 text-sm font-normal" style={{ color: textSub }}>
                ({videos.length})
              </span>
            </h2>

            {videos.length === 0 ? (
              <div className="text-center py-10">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
                  className="flex justify-center mb-3" style={{ color: textSub, opacity: 0.5 }}>{Icons.video}</motion.div>
                <p className="text-sm" style={{ color: textSub }}>
                  Aucune vidéo pour cette formation
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {videos.map((video, i) => (
                    <motion.div key={video.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl group transition-all"
                      style={{ background: innerBg, border: `1px solid ${innerBorder}` }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = innerBorder}>

                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: accentLight }}>
                        {video.orderIndex}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: textPrimary }}>{video.title}</p>
                      </div>

                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(video.id)}
                        className="text-xs px-2.5 py-1 rounded-lg transition opacity-0 group-hover:opacity-100"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                        Supprimer
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Rappel quiz */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-5 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0" style={{ color: '#f59e0b' }}>{Icons.note}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1" style={{ color: dark ? '#fcd34d' : '#92400e' }}>
                  N'oubliez pas le quiz !
                </p>
                <p className="text-xs mb-3" style={{ color: textSub }}>
                  Les apprenants ont besoin d'un quiz pour obtenir leur certificat.
                </p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/instructor/courses/${courseId}/quiz`)}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#1a0e00',
                    boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
                  }}>
                  Créer le quiz →
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </InstructorLayout>
  );
};

export default UploadVideoPage;