import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuiz, submitQuiz, downloadCertificate } from '../../services/quizService';
import LearnerLayout from '../../components/layouts/LearnerLayout';

const T = {
  accent: '#6366f1',
  accentRgb: '99,102,241',
  accentEnd: '#4f46e5',
  accentLight: '#a5b4fc',
  accentBg: 'rgba(99,102,241,0.12)',
  accentBorder: 'rgba(99,102,241,0.25)',
  surface: 'rgba(255,255,255,0.05)',
  surfaceBorder: 'rgba(255,255,255,0.1)',
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.5)',
};

/* ── Anneau de score animé ── */
const ScoreRing = ({ percent, passed, size = 160 }) => {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={passed ? '#10b981' : '#ef4444'} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="text-4xl font-black" style={{ color: passed ? '#34d399' : '#f87171' }}>
          {percent}%
        </motion.span>
        <span className="text-xs font-medium" style={{ color: T.textSub }}>score obtenu</span>
      </div>
    </div>
  );
};

const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    getQuiz(courseId)
      .then(setQuiz)
      .catch(() => setError('Aucun quiz disponible pour cette formation'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const questions = quiz?.questions || [];
  const total = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === total - 1;
  const isFirst = currentIndex === 0;

  const handleAnswer = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const goTo = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleSubmit = async () => {
    if (answeredCount < total) {
      setError('Veuillez répondre à toutes les questions avant de soumettre');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const data = await submitQuiz(quiz.id, answers);
      setResult(data);
    } catch (err) {
      setError('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCert = async () => {
    setCertLoading(true);
    try { await downloadCertificate(courseId); }
    catch (err) { setError('Erreur lors du téléchargement'); }
    finally { setCertLoading(false); }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
  };

  /* ── États de chargement / erreur ── */
  if (loading) return (
    <LearnerLayout>
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2"
            style={{ borderColor: `${T.accent} transparent transparent transparent` }} />
          <p style={{ color: T.textSub }} className="text-sm">Chargement du quiz...</p>
        </div>
      </div>
    </LearnerLayout>
  );

  if (error && !quiz) return (
    <LearnerLayout>
      <div className="max-w-md mx-auto text-center py-24">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: T.text }}>Quiz non disponible</h2>
        <p className="text-sm mb-6" style={{ color: T.textSub }}>{error}</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl text-sm font-semibold"
          style={{ background: T.surface, border: `1px solid ${T.surfaceBorder}`, color: T.text }}>
          ← Retour
        </motion.button>
      </div>
    </LearnerLayout>
  );

  /* ══════════ ÉCRAN RÉSULTAT ══════════ */
  if (result) return (
  <LearnerLayout>
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${result.passed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
          boxShadow: result.passed
            ? '0 24px 60px rgba(16,185,129,0.12)'
            : '0 24px 60px rgba(239,68,68,0.1)',
        }}>

        {/* ── Bande colorée haut ── */}
        <div className="h-1.5 w-full"
          style={{ background: result.passed
            ? 'linear-gradient(90deg,#10b981,#34d399)'
            : 'linear-gradient(90deg,#ef4444,#f87171)' }} />

        <div className="p-10 text-center">

          {/* ── Icône principale ── */}
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 180 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: result.passed
                ? 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))'
                : 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05))',
              border: `1px solid ${result.passed ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
            <i className={`fa-solid ${result.passed ? 'fa-trophy' : 'fa-circle-xmark'} text-4xl`}
              style={{ color: result.passed ? '#10b981' : '#ef4444' }} />
          </motion.div>

          {/* ── Titre ── */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-2xl font-black mb-1"
            style={{ color: result.passed ? '#34d399' : '#f87171' }}>
            {result.passed ? 'Quiz réussi !' : 'Quiz non validé'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-sm mb-8" style={{ color: T.textSub }}>
            {result.passed
              ? 'Félicitations, vous avez validé cette formation'
              : 'Pas d\'inquiétude, vous pouvez réessayer'}
          </motion.p>

          {/* ── Anneau de score ── */}
          <div className="flex justify-center mb-6">
            <ScoreRing percent={result.scorePercent} passed={result.passed} />
          </div>

          {/* ── Stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center gap-6 mb-8 py-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-center">
              <div className="text-xl font-black" style={{ color: T.text }}>{result.score}</div>
              <div className="text-[11px]" style={{ color: T.textSub }}>
                <i className="fa-solid fa-check mr-1" style={{ color: '#10b981' }} />
                correctes
              </div>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="text-center">
              <div className="text-xl font-black" style={{ color: T.text }}>{result.totalQuestions}</div>
              <div className="text-[11px]" style={{ color: T.textSub }}>
                <i className="fa-solid fa-list-check mr-1" style={{ color: T.accentLight }} />
                questions
              </div>
            </div>
            <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="text-center">
              <div className="text-xl font-black" style={{ color: result.passed ? '#34d399' : '#f87171' }}>
                {result.scorePercent}%
              </div>
              <div className="text-[11px]" style={{ color: T.textSub }}>
                <i className="fa-solid fa-chart-simple mr-1" style={{ color: T.accentLight }} />
                score
              </div>
            </div>
          </motion.div>

          {/* ── Message ── */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm font-semibold mb-8"
            style={{ color: result.passed ? '#6ee7b7' : '#fca5a5' }}>
            {result.message}
          </motion.p>

          {/* ── Boutons ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex gap-3 justify-center flex-wrap">
            {result.passed ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadCert} disabled={certLoading}
                  className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg,#10b981,#059669)',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                  }}>
                  <i className={`fa-solid ${certLoading ? 'fa-spinner fa-spin' : 'fa-download'}`} />
                  {certLoading ? 'Génération...' : 'Télécharger mon certificat'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/learner/dashboard')}
                  className="px-6 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
                  style={{ background: T.surface, border: `1px solid ${T.surfaceBorder}`, color: T.text }}>
                  <i className="fa-solid fa-house" />
                  Mon espace
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleRetry}
                  className="px-7 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5"
                  style={{
                    background: `linear-gradient(135deg,${T.accent},${T.accentEnd})`,
                    boxShadow: `0 8px 24px rgba(${T.accentRgb},0.35)`,
                  }}>
                  <i className="fa-solid fa-rotate-right" />
                  Réessayer
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(-1)}
                  className="px-6 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2"
                  style={{ background: T.surface, border: `1px solid ${T.surfaceBorder}`, color: T.text }}>
                  <i className="fa-solid fa-arrow-left" />
                  Retour au cours
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  </LearnerLayout>
);

  /* ══════════ ÉCRAN QUIZ — une question à la fois ══════════ */
  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <LearnerLayout>
      <div className="max-w-2xl mx-auto">

        <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium mb-6"
          style={{ color: T.accentLight }}>
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour au cours
        </motion.button>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 mb-6 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg,${T.accent},${T.accentEnd})`, boxShadow: `0 16px 40px rgba(${T.accentRgb},0.3)` }}>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)' }}>📝</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">{quiz?.title || 'Quiz final'}</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {total} questions • Score minimum requis : 70%
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-black text-white">{answeredCount}/{total}</div>
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>répondu(es)</div>
            </div>
          </div>

          {/* Dots de navigation */}
          <div className="flex gap-1.5 mt-5 relative z-10">
            {questions.map((q, i) => (
              <motion.button key={q.id} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                onClick={() => goTo(i)}
                className="flex-1 h-2 rounded-full overflow-hidden relative"
                style={{ background: 'rgba(255,255,255,0.25)' }}>
                {(answers[q.id] !== undefined || i === currentIndex) && (
                  <motion.div layoutId={`dot-${i}`}
                    className="absolute inset-0 rounded-full"
                    style={{ background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.85)' }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }} />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-3 rounded-xl mb-4 text-sm flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Question courante ── */}
        <AnimatePresence mode="wait" custom={direction}>
          {currentQuestion && (
            <motion.div key={currentQuestion.id}
              custom={direction}
              variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="rounded-3xl p-7 mb-6"
              style={{ background: T.surface, border: `1px solid ${T.surfaceBorder}` }}>

              <div className="flex items-start gap-3 mb-6">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: answers[currentQuestion.id] !== undefined
                      ? 'linear-gradient(135deg,#10b981,#059669)'
                      : T.accentBg,
                    color: answers[currentQuestion.id] !== undefined ? 'white' : T.accentLight,
                    border: answers[currentQuestion.id] === undefined ? `1px solid ${T.accentBorder}` : 'none',
                  }}>
                  {answers[currentQuestion.id] !== undefined ? (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : currentIndex + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.textSub }}>
                    Question {currentIndex + 1} sur {total}
                  </p>
                  <p className="font-bold text-lg leading-snug" style={{ color: T.text }}>
                    {currentQuestion.questionText}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentQuestion.options?.map((option, i) => {
                  const isSelected = answers[currentQuestion.id] === option.id;
                  return (
                    <motion.button key={option.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswer(currentQuestion.id, option.id)}
                      className="w-full text-left px-5 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3 transition-colors"
                      style={isSelected ? {
                        background: `linear-gradient(135deg,rgba(99,102,241,0.22),rgba(79,70,229,0.12))`,
                        border: `1.5px solid rgba(${T.accentRgb},0.5)`,
                        color: T.text,
                      } : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)',
                      }}>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={isSelected ? {
                          background: T.accent,
                          boxShadow: `0 0 0 3px rgba(${T.accentRgb},0.2)`,
                        } : { border: '1.5px solid rgba(255,255,255,0.25)' }}>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </span>
                      {option.optionText}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Navigation préc/suiv ── */}
        <div className="flex items-center justify-between gap-3">
          <motion.button whileHover={{ scale: 1.03, x: -2 }} whileTap={{ scale: 0.97 }}
            disabled={isFirst}
            onClick={() => goTo(currentIndex - 1)}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-30"
            style={{ background: T.surface, border: `1px solid ${T.surfaceBorder}`, color: T.text }}>
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Précédent
          </motion.button>

          {isLast ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              disabled={submitting}
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}>
              {submitting ? 'Correction en cours...' : 'Soumettre le quiz'}
              {!submitting && (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.03, x: 2 }} whileTap={{ scale: 0.97 }}
              onClick={() => goTo(currentIndex + 1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold text-white transition"
              style={{ background: `linear-gradient(135deg,${T.accent},${T.accentEnd})`, boxShadow: `0 4px 14px rgba(${T.accentRgb},0.4)` }}>
              Suivant
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default QuizPage;