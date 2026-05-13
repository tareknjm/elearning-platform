import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { createCourse } from '../../services/courseService';
import { getCategories } from '../../services/categoryService';

const categoryIcons = {
  'Développement Web': '🌐', 'Développement Mobile': '📱',
  'Java & Spring Boot': '☕', 'Python': '🐍',
  'JavaScript & React': '⚛️', 'Angular & Vue.js': '🔺',
  'Base de données & SQL': '🗄️', 'DevOps & Cloud': '☁️',
  'Intelligence Artificielle': '🤖', 'Machine Learning': '🧠',
  'Cybersécurité': '🔒', 'Design UI/UX': '🎨',
  'Flutter & Dart': '💙', 'PHP & Laravel': '🐘',
  'Node.js': '💚', 'Docker & Kubernetes': '🐳',
  'Algorithmique': '📊', 'Mathématiques': '📐',
  'Gestion de projet': '📋', 'Marketing Digital': '📣',
};

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', level: 'Débutant', categoryId: '' });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => { getCategories().then(setCategories).catch(console.error); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) { setError('Veuillez choisir une catégorie'); return; }
    setLoading(true); setError('');
    try {
      await createCourse({ ...form, categoryId: Number(form.categoryId) });
      navigate('/instructor/dashboard');
    } catch (err) {
      setError('Erreur lors de la création');
    } finally { setLoading(false); }
  };

  const selectedCat = categories.find(c => c.id === Number(form.categoryId));

  return (
    <InstructorLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto">

        <h1 className="text-2xl font-bold text-white mb-1">Créer une formation</h1>
        <p className="text-emerald-400 text-sm mb-8">Partagez votre expertise avec des milliers d'apprenants</p>

        {error && (
          <div className="mb-5 p-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="inst-form-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="inst-label">Titre de la formation *</label>
              <input type="text" name="title" value={form.title}
                onChange={handleChange} required className="inst-input"
                placeholder="Ex: Spring Boot pour débutants" />
            </div>

            <div>
              <label className="inst-label">Description</label>
              <textarea name="description" value={form.description}
                onChange={handleChange} rows={4}
                className="inst-input resize-none"
                placeholder="Décrivez le contenu et les objectifs de votre formation..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="inst-label">Niveau *</label>
                <select name="level" value={form.level}
                  onChange={handleChange} className="inst-input">
                  <option value="Débutant">🟢 Débutant</option>
                  <option value="Intermédiaire">🟡 Intermédiaire</option>
                  <option value="Avancé">🔴 Avancé</option>
                </select>
              </div>
              <div>
                <label className="inst-label">Catégorie *</label>
                <select name="categoryId" value={form.categoryId}
                  onChange={handleChange} className="inst-input" required>
                  <option value="">-- Choisir --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {categoryIcons[cat.name] || '📚'} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="text-2xl">{categoryIcons[selectedCat.name] || '📚'}</span>
                <div>
                  <div className="text-emerald-400 text-xs">Catégorie sélectionnée</div>
                  <div className="text-white text-sm font-semibold">{selectedCat.name}</div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="inst-btn flex-1 py-3 disabled:opacity-50">
                {loading ? 'Création...' : '🚀 Créer la formation'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                type="button" onClick={() => navigate('/instructor/dashboard')}
                className="flex-1 py-3 rounded-xl font-medium text-gray-400 transition"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Annuler
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </InstructorLayout>
  );
};

export default CreateCoursePage;