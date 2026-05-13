import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideosByCourse } from '../../services/videoService';
import { getCourseById } from '../../services/courseService';
import { markVideoWatched, getCourseProgress } from '../../services/progressService';
import { hasPassed, downloadCertificate } from '../../services/quizService';
const WatchCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [watchedIds, setWatchedIds] = useState(new Set());
  const [progress, setProgress] = useState(null);
  const [passed, setPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, [courseId]);

  const loadAll = async () => {
    try {
      const [courseData, videosData, progressData, passedData] = await Promise.all([
        getCourseById(courseId),
        getVideosByCourse(courseId),
        getCourseProgress(courseId),
        hasPassed(courseId),
      ]);
      setCourse(courseData);
      setVideos(videosData);
      setProgress(progressData);
      setPassed(passedData);
      if (videosData.length > 0) setCurrentVideo(videosData[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = async () => {
    if (!currentVideo) return;
    try {
      await markVideoWatched(currentVideo.id);
      setWatchedIds(prev => new Set([...prev, currentVideo.id]));
      const newProgress = await getCourseProgress(courseId);
      setProgress(newProgress);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVideoSelect = async (video) => {
    setCurrentVideo(video);
  };

  const handleDownloadCert = async () => {
    setCertLoading(true);
    try {
      await downloadCertificate(courseId);
    } catch (err) {
      console.error(err);
    } finally {
      setCertLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
      Chargement...
    </div>
  );

  const progressPercent = progress?.progressPercent || 0;
  const isCompleted = progress?.completed || false;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center gap-4">
        <button onClick={() => navigate('/learner/dashboard')}
          className="text-gray-400 hover:text-white transition text-sm">
          ← Retour
        </button>
        <h1 className="text-white font-semibold flex-1 truncate">{course?.title}</h1>

        {/* Progression */}
        <div className="flex items-center gap-3">
          <div className="w-32 bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100
                  ? 'linear-gradient(to right, #10b981, #34d399)'
                  : 'linear-gradient(to right, #6366f1, #8b5cf6)'
              }}>
            </div>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {progressPercent}% complété
          </span>
        </div>

        {/* Bouton Quiz */}
        {isCompleted && !passed && (
          <button
            onClick={() => navigate(`/learner/courses/${courseId}/quiz`)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition">
            📝 Passer le quiz
          </button>
        )}

        {/* Bouton Certificat */}
        {passed && (
          <button onClick={handleDownloadCert} disabled={certLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
            {certLoading ? '...' : '🏆 Certificat'}
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Lecteur vidéo */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentVideo ? (
            <div>
              <video
                key={currentVideo.id}
                controls
                onEnded={handleVideoEnd}
                className="w-full rounded-2xl bg-black shadow-2xl"
                style={{ maxHeight: '480px' }}
                src={`http://localhost:8080${currentVideo.url}`}>
              </video>

              {/* Infos vidéo */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-xl font-semibold">{currentVideo.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Vidéo {currentVideo.orderIndex} sur {videos.length}
                    {watchedIds.has(currentVideo.id) && (
                      <span className="ml-2 text-emerald-400">✓ Vue</span>
                    )}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  <button
                    disabled={currentVideo.orderIndex <= 1}
                    onClick={() => {
                      const prev = videos.find(v => v.orderIndex === currentVideo.orderIndex - 1);
                      if (prev) handleVideoSelect(prev);
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition disabled:opacity-30 text-sm">
                    ← Préc.
                  </button>
                  <button
                    disabled={currentVideo.orderIndex >= videos.length}
                    onClick={() => {
                      const next = videos.find(v => v.orderIndex === currentVideo.orderIndex + 1);
                      if (next) handleVideoSelect(next);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition disabled:opacity-30 text-sm">
                    Suiv. →
                  </button>
                </div>
              </div>

              {/* Bannière complétion */}
              {isCompleted && (
                <div className={`mt-6 rounded-2xl p-5 ${passed
                  ? 'bg-emerald-900/40 border border-emerald-500/30'
                  : 'bg-amber-900/40 border border-amber-500/30'}`}>
                  {passed ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-emerald-400 font-bold text-lg">
                          🏆 Formation complétée et quiz réussi !
                        </div>
                        <div className="text-emerald-300 text-sm mt-1">
                          Téléchargez votre certificat
                        </div>
                      </div>
                      <button onClick={handleDownloadCert} disabled={certLoading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition">
                        {certLoading ? 'Génération...' : '⬇ Télécharger le certificat'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-amber-400 font-bold text-lg">
                          🎉 Toutes les vidéos vues !
                        </div>
                        <div className="text-amber-300 text-sm mt-1">
                          Passez le quiz final pour obtenir votre certificat
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/learner/courses/${courseId}/quiz`)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-medium transition">
                        📝 Passer le quiz →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20">
              Aucune vidéo disponible
            </div>
          )}
        </div>

        {/* Playlist */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold text-sm">
              Contenu ({videos.length} vidéos)
            </h3>
            {/* Barre de progression playlist */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{progress?.watchedVideos || 0} / {progress?.totalVideos || 0} vues</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                  style={{ width: `${progressPercent}%` }}>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {videos.map((video) => {
              const isWatched = watchedIds.has(video.id) ||
                (progress?.watchedVideos >= video.orderIndex);
              const isCurrent = currentVideo?.id === video.id;

              return (
                <button key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className={`w-full text-left p-3 rounded-xl mb-1.5 transition flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isWatched
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-600 text-gray-300'
                  }`}>
                    {isWatched ? '✓' : video.orderIndex}
                  </div>
                  <span className="text-sm truncate">{video.title}</span>
                </button>
              );
            })}

            {/* Bouton Quiz dans la playlist */}
            {isCompleted && (
              <button
                onClick={() => navigate(`/learner/courses/${courseId}/quiz`)}
                className={`w-full text-left p-3 rounded-xl mt-2 flex items-center gap-3 transition ${
                  passed
                    ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                }`}>
                <div className="w-7 h-7 rounded-full bg-current/20 flex items-center justify-center text-xs flex-shrink-0">
                  {passed ? '🏆' : '📝'}
                </div>
                <span className="text-sm font-medium">
                  {passed ? 'Quiz réussi !' : 'Quiz final'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchCoursePage;