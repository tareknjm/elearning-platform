import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { uploadVideo, getVideosByCourse, deleteVideo } from '../../services/videoService';
import { getCourseById } from '../../services/courseService';
import InstructorLayout from '../../components/layouts/InstructorLayout';

const UploadVideoPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: '', orderIndex: 1 });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      const [courseData, videosData] = await Promise.all([
        getCourseById(courseId),
        getVideosByCourse(courseId)
      ]);
      setCourse(courseData);
      setVideos(videosData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Veuillez sélectionner un fichier vidéo');
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', form.title);
      formData.append('orderIndex', form.orderIndex);
      formData.append('file', file);
      const newVideo = await uploadVideo(formData);
      setVideos([...videos, newVideo]);
      setForm({ title: '', orderIndex: videos.length + 2 });
      setFile(null);
      setSuccess('Vidéo uploadée avec succès !');
      document.getElementById('fileInput').value = '';
    } catch (err) {
      setError("Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Supprimer cette vidéo ?')) return;
    try {
      await deleteVideo(videoId);
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <InstructorLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <button onClick={() => navigate('/instructor/dashboard')}
              className="text-primary-600 hover:underline text-sm block mb-2">
              ← Retour à mes formations
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Gérer les vidéos</h1>
            {course && (
              <p className="text-gray-500 mt-1">
                Formation : <strong>{course.title}</strong>
              </p>
            )}
          </div>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/quiz`)}
            className="btn-primary">
            📝 Créer le quiz
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Formulaire upload */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Ajouter une vidéo
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-xl mb-4 text-sm">
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Titre de la vidéo
                </label>
                <input type="text" value={form.title} required
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder="Ex: Introduction au cours" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ordre
                </label>
                <input type="number" value={form.orderIndex} min="1"
                  onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                  className="input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fichier vidéo
                </label>
                <input id="fileInput" type="file" accept="video/*" required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="input" />
                {file && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    📎 {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? '⏳ Upload en cours...' : '⬆ Uploader la vidéo'}
              </button>
            </form>
          </div>

          {/* Liste vidéos */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Vidéos ({videos.length})
            </h2>

            {videos.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-sm">Aucune vidéo pour cette formation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {videos
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((video) => (
                  <div key={video.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary-100 text-primary-700 text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {video.orderIndex}
                      </span>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">
                        {video.title}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(video.id)}
                      className="text-red-400 hover:text-red-600 text-sm transition hover:underline flex-shrink-0">
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Rappel quiz */}
            {videos.length > 0 && (
              <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-sm text-amber-700 font-medium mb-2">
                  📝 N'oubliez pas le quiz !
                </p>
                <p className="text-xs text-amber-600 mb-3">
                  Les apprenants ont besoin d'un quiz pour obtenir leur certificat.
                </p>
                <button
                  onClick={() => navigate(`/instructor/courses/${courseId}/quiz`)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-xl text-sm font-medium transition">
                  📝 Créer le quiz →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default UploadVideoPage;