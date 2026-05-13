import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import { getCourseById } from '../../services/courseService';
import { getVideosByCourse } from '../../services/videoService';
import { enroll, isEnrolled } from '../../services/enrollmentService';
import { getRatingStats, rateCourse } from '../../services/ratingService';
import { useAuth } from '../../context/AuthContext';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [ratingStats, setRatingStats] = useState(null);
  const [myStars, setMyStars] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [error, setError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [courseData, videosData, stats] = await Promise.all([
        getCourseById(id),
        getVideosByCourse(id),
        getRatingStats(id),
      ]);
      setCourse(courseData);
      setVideos(videosData);
      setRatingStats(stats);

      if (user?.role === 'LEARNER') {
        const enrolledStatus = await isEnrolled(id);
        setEnrolled(enrolledStatus);
        if (stats.userHasRated) {
          setMyStars(stats.userRating);
          setMyComment(stats.userComment || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrollLoading(true);
    setError('');
    try {
      await enroll(id);
      setEnrolled(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleRate = async () => {
    if (myStars === 0) return;
    setRatingLoading(true);
    setRatingSuccess('');
    try {
      await rateCourse(id, myStars, myComment);
      const stats = await getRatingStats(id);
      setRatingStats(stats);
      setRatingSuccess('Votre avis a été enregistré !');
      setTimeout(() => setRatingSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setRatingLoading(false);
    }
  };

  const renderStars = (value) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={`text-lg ${
            s <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'
          }`}>★</span>
        ))}
      </div>
    );
  };

  if (loading) return (
    <Layout>
      <div className="text-center py-20 text-gray-400">Chargement...</div>
    </Layout>
  );

  if (!course) return (
    <Layout>
      <div className="text-center py-20 text-gray-400">Formation introuvable</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="text-primary-600 hover:underline mb-6 block text-sm">
          ← Retour
        </button>

        {/* Card principale */}
        <div className="card mb-6">
          <div className="flex gap-2 mb-4">
            {course.categoryName && (
              <span className="badge-learner">{course.categoryName}</span>
            )}
            {course.level && (
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                {course.level}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-400 text-sm mb-2">
            Par <span className="text-gray-600 font-medium">{course.instructorName}</span>
          </p>

          {/* Note moyenne */}
          {ratingStats && ratingStats.totalRatings > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {renderStars(ratingStats.averageRating)}
              <span className="font-bold text-amber-500">
                {ratingStats.averageRating}
              </span>
              <span className="text-gray-400 text-sm">
                ({ratingStats.totalRatings} avis)
              </span>
            </div>
          )}

          <p className="text-gray-600 leading-relaxed mb-8">{course.description}</p>

          {/* Stats */}
          <div className="flex gap-6 py-4 border-t border-b border-gray-100 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{videos.length}</div>
              <div className="text-xs text-gray-400 mt-1">Vidéos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {ratingStats?.averageRating || '—'}
              </div>
              <div className="text-xs text-gray-400 mt-1">Note</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-500">
                {ratingStats?.totalRatings || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Avis</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Boutons action */}
          {!user && (
            <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">
              Se connecter pour s'inscrire
            </button>
          )}
          {user?.role === 'LEARNER' && !enrolled && (
            <button onClick={handleEnroll} disabled={enrollLoading}
              className="btn-primary w-full py-3 disabled:opacity-50">
              {enrollLoading ? 'Inscription...' : "S'inscrire gratuitement"}
            </button>
          )}
          {user?.role === 'LEARNER' && enrolled && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <span>✅</span>
                <span>Vous êtes inscrit à cette formation</span>
              </div>
              <button
                onClick={() => navigate(`/learner/courses/${id}/watch`)}
                className="btn-primary w-full py-3">
                Accéder aux vidéos →
              </button>
            </div>
          )}
        </div>

        {/* Section notation — visible seulement si inscrit */}
        {user?.role === 'LEARNER' && enrolled && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {ratingStats?.userHasRated ? 'Modifier mon avis' : 'Noter cette formation'}
            </h2>

            {ratingSuccess && (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl mb-4 text-sm">
                ✅ {ratingSuccess}
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Votre note :</p>
              <StarRating value={myStars} onChange={setMyStars} size="lg" />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1.5">
                Commentaire (optionnel)
              </label>
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Partagez votre expérience avec cette formation..." />
            </div>

            <button onClick={handleRate} disabled={ratingLoading || myStars === 0}
              className="btn-primary disabled:opacity-50">
              {ratingLoading ? 'Envoi...' : ratingStats?.userHasRated
                ? 'Mettre à jour mon avis' : 'Publier mon avis'}
            </button>
          </div>
        )}

        {/* Contenu du cours */}
        {videos.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Contenu ({videos.length} vidéos)
            </h2>
            <div className="space-y-2">
              {videos.map((video, index) => (
                <div key={video.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{video.title}</span>
                  {!enrolled && (
                    <span className="ml-auto text-gray-300 text-xs">🔒</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avis des apprenants */}
        {ratingStats && ratingStats.reviews.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Avis des apprenants
            </h2>
            <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-xl">
              <div className="text-5xl font-bold text-amber-500">
                {ratingStats.averageRating}
              </div>
              <div>
                {renderStars(ratingStats.averageRating)}
                <p className="text-sm text-gray-500 mt-1">
                  {ratingStats.totalRatings} avis au total
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {ratingStats.reviews.map((review) => (
                <div key={review.id}
                  className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {review.userName?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 text-sm">
                        {review.userName}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{review.createdAt}</span>
                  </div>
                  <div className="ml-10">
                    {renderStars(review.stars)}
                    {review.comment && (
                      <p className="text-gray-600 text-sm mt-1">{review.comment}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CourseDetailPage;