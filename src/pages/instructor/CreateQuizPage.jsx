import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InstructorLayout from '../../components/layouts/InstructorLayout';
import { useTheme } from '../../context/ThemeContext';
import { getCourseById } from '../../services/courseService';
import api from '../../services/api';

const emptyQuestion = () => ({
  id: Date.now() + Math.random(),
  questionText: '',
  options: [
    { id: 1, optionText: '', correct: false },
    { id: 2, optionText: '', correct: false },
    { id: 3, optionText: '', correct: false },
    { id: 4, optionText: '', correct: false },
  ],
});

const CreateQuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [course, setCourse]       = useState(null);
  const [title, setTitle]         = useState('Quiz final');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const t = {
    textPrimary:  dark ? '#ffffff'                 : '#111827',
    textSub:      dark ? 'rgba(255,255,255,0.45)'  : '#6b7280',
    surface:      dark ? '#0d1a14'                 : '#ffffff',
    border:       dark ? 'rgba(16,185,129,0.15)'   : '#e5e7eb',
    shadow:       dark ? 'none'                    : '0 1px 12px rgba(0,0,0,0.05)',
    accent:       '#10b981',
    accentText:   dark ? '#6ee7b7'                 : '#059669',
    accentLabel:  dark ? 'rgba(16,185,129,0.7)'    : '#059669',
    innerBg:      dark ? 'rgba(16,185,129,0.06)'   : '#f9fafb',
    innerBorder:  dark ? 'rgba(16,185,129,0.18)'   : '#e5e7eb',
    optBg:        dark ? 'rgba(255,255,255,0.03)'  : '#f8f9fa',
    optBorder:    dark ? 'rgba(255,255,255,0.07)'  : '#e5e7eb',
    optCorrectBg: dark ? 'rgba(16,185,129,0.1)'    : 'rgba(16,185,129,0.07)',
    optCorrectBorder: dark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)',
    inputColor:   dark ? 'white'                   : '#111827',
    placeholderColor: dark ? 'rgba(255,255,255,0.2)' : '#9ca3af',
  };

  const cardStyle = {
    background: t.surface,
    border: `1px solid ${t.border}`,
    borderRadius: '20px',
    boxShadow: t.shadow,
  };

  const inputStyle = {
    background: t.innerBg,
    border: `1px solid ${t.innerBorder}`,
    borderRadius: '12px',
    color: t.textPrimary,
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle = {
    color: t.accentLabel,
    fontSize: '11px',
    fontWeight: 700,
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  };

  useEffect(() => {
    getCourseById(courseId).then(setCourse).catch(console.error);
  }, [courseId]);

  const updateQuestion = (qId, field, value) =>
    setQuestions(qs => qs.map(q => q.id === qId ? { ...q, [field]: value } : q));

  const updateOption = (qId, optId, field, value) =>
    setQuestions(qs => qs.map(q => {
      if (q.id !== qId) return q;
      return { ...q, options: q.options.map(o => {
        if (field === 'correct') return { ...o, correct: o.id === optId };
        return o.id === optId ? { ...o, [field]: value } : o;
      })};
    }));

  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
  const removeQuestion = qId => setQuestions(qs => qs.filter(q => q.id !== qId));

  const handleSubmit = async e => {
    e.preventDefault();
    for (const q of questions) {
      if (!q.questionText.trim()) { setError('Remplissez tous les textes de questions'); return; }
      if (q.options.some(o => !o.optionText.trim())) { setError('Remplissez toutes les options'); return; }
      if (!q.options.some(o => o.correct)) { setError('Cochez une bonne réponse par question'); return; }
    }
    setError(''); setLoading(true);
    try {
      await api.post('/instructor/quiz', {
        title, courseId: Number(courseId),
        questions: questions.map(q => ({
          questionText: q.questionText,
          options: q.options.map(o => ({ optionText: o.optionText, correct: o.correct })),
        })),
      });
      setSuccess('Quiz créé avec succès !');
      setTimeout(() => navigate('/instructor/dashboard'), 1500);
    } catch { setError('Erreur lors de la création du quiz'); }
    finally { setLoading(false); }
  };

  return (
    <InstructorLayout>
      <style>{`
        .cq-input:focus { border-color: rgba(16,185,129,0.5) !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .cq-input::placeholder { color: ${t.placeholderColor}; }
      `}</style>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
          <button onClick={() => navigate(`/instructor/courses/${courseId}/videos`)}
            className="flex items-center gap-2 text-[13px] mb-3 transition"
            style={{ color: t.accentLabel }}
            onMouseEnter={e => e.currentTarget.style.color = t.accentText}
            onMouseLeave={e => e.currentTarget.style.color = t.accentLabel}>
            ← Retour
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              📝
            </div>
            <div>
              <h1 className="text-[1.8rem] font-bold tracking-tight" style={{ color: t.textPrimary, letterSpacing: '-0.025em' }}>
                Créer le quiz final
              </h1>
              {course && <p className="text-[12px] mt-0.5" style={{ color: t.textSub }}>{course.title}</p>}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: dark ? '#fcd34d' : '#b45309' }}>
            ⚡ Les apprenants doivent obtenir 70% pour recevoir leur certificat
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 rounded-xl text-[13px] flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 rounded-xl text-[13px] flex items-center gap-2"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: t.accentText }}>
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Titre quiz */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={cardStyle} className="p-6">
            <div className="h-0.5 rounded-full mb-5 -mt-1" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />
            <label style={labelStyle}>Titre du quiz</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              required className="cq-input" style={inputStyle} placeholder="Ex: Quiz final — Spring Boot" />
          </motion.div>

          {/* Questions */}
          <AnimatePresence>
            {questions.map((q, qi) => (
              <motion.div key={q.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }} transition={{ duration: 0.3 }}
                style={cardStyle} className="p-6">
                <div className="h-0.5 rounded-full mb-5 -mt-1" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />

                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white"
                      style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                      {qi + 1}
                    </div>
                    <span className="font-semibold text-[14px]" style={{ color: t.textPrimary }}>Question {qi + 1}</span>
                  </div>
                  {questions.length > 1 && (
                    <motion.button type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => removeQuestion(q.id)}
                      className="text-[12px] px-3 py-1.5 rounded-xl font-medium"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5' }}>
                      Supprimer
                    </motion.button>
                  )}
                </div>

                <div className="mb-4">
                  <label style={labelStyle}>Texte de la question</label>
                  <textarea value={q.questionText}
                    onChange={e => updateQuestion(q.id, 'questionText', e.target.value)}
                    rows={2} placeholder="Saisissez votre question..."
                    className="cq-input resize-none" style={inputStyle} />
                </div>

                <div>
                  <label style={{ ...labelStyle, marginBottom: '10px' }}>
                    Options — cliquez sur le cercle pour marquer la bonne réponse
                  </label>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <motion.div key={opt.id} whileHover={{ x: 2 }}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all"
                        style={{
                          background: opt.correct ? t.optCorrectBg : t.optBg,
                          border: `1px solid ${opt.correct ? t.optCorrectBorder : t.optBorder}`,
                        }}>
                        <motion.button type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={() => updateOption(q.id, opt.id, 'correct', true)}
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                          style={opt.correct ? {
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 0 10px rgba(16,185,129,0.4)',
                          } : {
                            background: 'transparent',
                            border: `2px solid ${t.optBorder}`,
                          }}>
                          {opt.correct && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                              className="text-white text-[11px] font-black">✓</motion.span>
                          )}
                        </motion.button>
                        <span className="text-[12px] font-bold flex-shrink-0"
                          style={{ color: opt.correct ? t.accentText : t.textSub, minWidth: '16px' }}>
                          {['A', 'B', 'C', 'D'][oi]}
                        </span>
                        <input type="text" value={opt.optionText}
                          onChange={e => updateOption(q.id, opt.id, 'optionText', e.target.value)}
                          placeholder={`Option ${['A', 'B', 'C', 'D'][oi]}...`}
                          className="cq-input flex-1"
                          style={{
                            ...inputStyle,
                            background: 'transparent',
                            border: 'none',
                            padding: '4px 0',
                            color: opt.correct ? t.accentText : t.textPrimary,
                          }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Ajouter question */}
          <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={addQuestion}
            className="w-full py-4 rounded-2xl font-semibold text-[13px] flex items-center justify-center gap-2 transition"
            style={{ background: dark ? 'rgba(16,185,129,0.05)' : '#f8f9fa', border: `2px dashed ${dark ? 'rgba(16,185,129,0.25)' : '#d1d5db'}`, color: t.accentText }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = dark ? 'rgba(16,185,129,0.25)' : '#d1d5db'}>
            <span className="text-lg">+</span>
            Ajouter une question
          </motion.button>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={cardStyle} className="p-5">
            <div className="h-0.5 rounded-full mb-4 -mt-1" style={{ background: 'linear-gradient(to right, #10b981, #059669)' }} />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="px-3 py-1.5 rounded-xl text-[12px] font-bold"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: t.accentText }}>
                  {questions.length} question{questions.length > 1 ? 's' : ''}
                </div>
                <div className="px-3 py-1.5 rounded-xl text-[12px] font-bold"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: dark ? '#fcd34d' : '#b45309' }}>
                  Seuil : 70%
                </div>
              </div>
              <p className="text-[11px]" style={{ color: t.textSub }}>Requis pour le certificat</p>
            </div>
            <div className="flex gap-3">
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 py-4 rounded-2xl font-bold text-white text-[13px] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                {loading ? '⏳ Création...' : '🚀 Créer le quiz'}
              </motion.button>
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/instructor/courses/${courseId}/videos`)}
                className="px-6 py-4 rounded-2xl font-semibold text-[13px]"
                style={{ background: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6', border: `1px solid ${t.border}`, color: t.textSub }}>
                Annuler
              </motion.button>
            </div>
          </motion.div>
        </form>
      </div>
    </InstructorLayout>
  );
};

export default CreateQuizPage;