import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import LearnerLayout from '../../components/layouts/LearnerLayout';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { getApprovedCourses, searchCourses } from '../../services/courseService';
import { getCategories, getCoursesByCategory } from '../../services/categoryService';

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

const CoursesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const isLearner = user?.role === 'LEARNER';
  const isInstructor = user?.role === 'INSTRUCTOR';
  const isDark = isLearner || isInstructor;

  const Wrapper = isLearner
    ? LearnerLayout
    : isInstructor
    ? InstructorLayout
    : Layout;

  // Couleurs thème selon rôle
  const theme = isInstructor ? {
    accent: '16,185,129',
    accentHex: '#10b981',
    accentLight: '#6ee7b7',
    accentBg: 'rgba(16,185,129,0.1)',
    accentBorder: 'rgba(16,185,129,0.2)',
    cardBg: '#0d1a14',
    cardBorder: 'rgba(16,185,129,0.15)',
  } : {
    accent: '139,92,246',
    accentHex: '#8b5cf6',
    accentLight: '#c4b5fd',
    accentBg: 'rgba(139,92,246,0.1)',
    accentBorder: 'rgba(139,92,246,0.2)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(139,92,246,0.15)',
  };

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const categoryId = searchParams.get('category');
    if (categoryId) {
      setActiveCategory(Number(categoryId));
      loadByCategory(Number(categoryId));
    } else {
      setActiveCategory(null);
      loadCourses();
    }
  }, [searchParams]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getApprovedCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const data = await getCoursesByCategory(categoryId);
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (cat) => {
    setKeyword('');
    if (activeCategory === cat.id) setSearchParams({});
    else setSearchParams({ category: cat.id });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) { setSearchParams({}); return; }
    setLoading(true);
    setActiveCategory(null);
    setSearchParams({});
    try {
      const data = await searchCourses(keyword);
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name;

  return (
    <Wrapper>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Formations
        </h1>
        <p style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>
          {activeCategory
            ? `Catégorie : ${activeCategoryName}`
            : `${courses.length} formation(s) disponibles`}
        </p>
      </div>

      {/* Barre de recherche */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: isDark ? `rgba(${theme.accent},0.6)` : '#9ca3af' }}>
            🔍
          </span>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={isDark ? {
              background: theme.cardBg,
              border: `1px solid ${theme.accentBorder}`,
              color: 'white',
            } : {
              background: 'white',
              border: '1px solid #e5e7eb',
              color: '#111827',
            }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
          style={{
            background: `linear-gradient(135deg, ${theme.accentHex}, ${isInstructor ? '#059669' : '#6366f1'})`,
            boxShadow: `0 4px 15px rgba(${theme.accent},0.3)`,
          }}>
          Rechercher
        </motion.button>
        {(keyword || activeCategory) && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            type="button"
            onClick={() => { setKeyword(''); setSearchParams({}); }}
            className="px-4 py-3 rounded-xl text-sm font-medium"
            style={isDark ? {
              background: theme.accentBg,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.accentLight,
            } : {
              border: '1px solid #e5e7eb',
              color: '#6b7280',
            }}>
            ✕ Tout voir
          </motion.button>
        )}
      </form>

      {/* Catégories */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: isDark ? `rgba(${theme.accent},0.6)` : '#9ca3af', letterSpacing: '0.1em' }}>
          Naviguer par catégorie
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(cat)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={activeCategory === cat.id ? {
                background: `linear-gradient(135deg, ${theme.accentHex}, ${isInstructor ? '#059669' : '#6366f1'})`,
                color: 'white',
                boxShadow: `0 4px 15px rgba(${theme.accent},0.4)`,
              } : isDark ? {
                background: theme.accentBg,
                border: `1px solid ${theme.accentBorder}`,
                color: 'rgba(255,255,255,0.7)',
              } : {
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#374151',
              }}>
              <span>{categoryIcons[cat.name] || '📚'}</span>
              <span>{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl p-6 animate-pulse"
              style={{
                background: isDark ? theme.cardBg : '#f9fafb',
                border: isDark ? `1px solid ${theme.accentBorder}` : '1px solid #f0f0f0',
                height: '220px',
              }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
            Aucune formation trouvée
          </h3>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => { setKeyword(''); setSearchParams({}); }}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-medium"
            style={isDark ? {
              background: theme.accentBg,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.accentLight,
            } : {
              border: '1px solid #e5e7eb',
              color: '#6b7280',
            }}>
            Voir toutes les formations
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="flex flex-col p-6 rounded-2xl"
                style={{
                  background: isDark ? theme.cardBg : 'white',
                  border: `1px solid ${isDark ? theme.cardBorder : '#f0f0f0'}`,
                  boxShadow: isDark ? 'none' : '0 2px 15px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = isDark
                    ? `rgba(${theme.accent},0.4)`
                    : '#e0e0e0';
                  if (isDark) e.currentTarget.style.boxShadow = `0 15px 40px rgba(${theme.accent},0.15)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isDark ? theme.cardBorder : '#f0f0f0';
                  e.currentTarget.style.boxShadow = isDark ? 'none' : '0 2px 15px rgba(0,0,0,0.05)';
                }}>

                {/* Barre top */}
                <div className="h-0.5 rounded-full mb-4 -mt-1"
                  style={{ background: `linear-gradient(to right, ${theme.accentHex}, ${isInstructor ? '#059669' : '#6366f1'})` }} />

                <div className="flex justify-between items-start mb-3">
                  <button
                    onClick={() => handleCategoryClick(categories.find(c => c.name === course.categoryName) || {})}
                    className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                    style={{
                      background: theme.accentBg,
                      border: `1px solid ${theme.accentBorder}`,
                      color: theme.accentLight,
                    }}>
                    <span>{categoryIcons[course.categoryName] || '📚'}</span>
                    <span>{course.categoryName || 'Général'}</span>
                  </button>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={isDark ? {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    } : {
                      background: '#f9fafb',
                      color: '#6b7280',
                    }}>
                    {course.level || 'Tous niveaux'}
                  </span>
                </div>

                <h3 className={`text-base font-bold mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {course.title}
                </h3>
                <p className="text-sm mb-3 line-clamp-2 flex-1"
                  style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>
                  {course.description}
                </p>

                {/* Étoiles */}
                {course.totalRatings > 0 ? (
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-xs"
                          style={{ color: s <= Math.round(course.averageRating) ? '#f59e0b' : (isDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb') }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>
                      {course.averageRating}
                    </span>
                    <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af' }}>
                      ({course.totalRatings})
                    </span>
                  </div>
                ) : (
                  <p className="text-xs mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>
                    Pas encore noté
                  </p>
                )}

                <div className="flex justify-between items-center pt-3"
                  style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5'}` }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: `linear-gradient(135deg, ${theme.accentHex}, ${isInstructor ? '#059669' : '#6366f1'})` }}>
                      {course.instructorName?.charAt(0)}
                    </div>
                    <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}>
                      {course.instructorName}
                    </span>
                  </div>
                  <Link to={`/courses/${course.id}`}
                    className="text-sm font-semibold flex items-center gap-1 transition"
                    style={{ color: theme.accentLight }}
                    onMouseEnter={e => e.currentTarget.style.color = theme.accentHex}
                    onMouseLeave={e => e.currentTarget.style.color = theme.accentLight}>
                    Voir →
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Wrapper>
  );
};

export default CoursesPage;