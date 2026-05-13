import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz, downloadCertificate } from '../../services/quizService';
import Layout from '../../components/Layout';
import LearnerLayout from '../../components/layouts/LearnerLayout';
const QuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [certLoading, setCertLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getQuiz(courseId)
      .then(setQuiz)
      .catch(() => setError('Aucun quiz disponible pour cette formation'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleAnswer = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      setError('Veuillez répondre à toutes les questions');
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
    try {
      await downloadCertificate(courseId);
    } catch (err) {
      setError('Erreur lors du téléchargement');
    } finally {
      setCertLoading(false);
    }
  };

  if (loading) return (
    <LearnerLayout>
      <div className="text-center py-20 text-gray-400">Chargement du quiz...</div>
    </LearnerLayout>
  );

  if (error && !quiz) return (
    <LearnerLayout>
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Quiz non disponible</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">← Retour</button>
      </div>
    </LearnerLayout>
  );

  // Résultat affiché après soumission
  if (result) return (
    <LearnerLayout>
      <div className="max-w-2xl mx-auto">
        <div className={`card text-center py-12 ${
          result.passed
            ? 'border-2 border-emerald-200'
            : 'border-2 border-red-100'
        }`}>
          <div className="text-6xl mb-4">{result.passed ? '🏆' : '😔'}</div>

          <h2 className={`text-3xl font-bold mb-2 ${
            result.passed ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {result.passed ? 'Quiz réussi !' : 'Quiz échoué'}
          </h2>

          {/* Score circulaire */}
          <div className="flex justify-center my-6">
            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-8 ${
              result.passed ? 'border-emerald-400' : 'border-red-300'
            }`}>
              <span className={`text-3xl font-bold ${
                result.passed ? 'text-emerald-600' : 'text-red-500'
              }`}>
                {result.scorePercent}%
              </span>
              <span className="text-xs text-gray-400">score</span>
            </div>
          </div>

          <p className="text-gray-600 mb-2">
            {result.score} bonne(s) réponse(s) sur {result.totalQuestions}
          </p>
          <p className={`font-medium mb-8 ${
            result.passed ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {result.message}
          </p>

          <div className="flex gap-3 justify-center">
            {result.passed ? (
              <>
                <button onClick={handleDownloadCert} disabled={certLoading}
                  className="btn-primary px-8 py-3">
                  {certLoading ? 'Génération...' : '⬇ Télécharger mon certificat'}
                </button>
                <button onClick={() => navigate('/learner/dashboard')}
                  className="btn-secondary px-6 py-3">
                  Mon espace
                </button>
              </>
            ) : (
              <>
                <button onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
                  className="btn-primary px-8 py-3">
                  🔄 Réessayer
                </button>
                <button onClick={() => navigate(-1)} className="btn-secondary px-6 py-3">
                  ← Retour au cours
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </LearnerLayout>
  );

  return (
    <LearnerLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="text-primary-600 hover:underline mb-6 block text-sm">
          ← Retour au cours
        </button>

        {/* Header Quiz */}
        <div className="card mb-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📝</div>
            <div>
              <h1 className="text-xl font-bold">{quiz?.title || 'Quiz final'}</h1>
              <p className="text-primary-100 text-sm mt-1">
                {quiz?.questions?.length} questions • Score minimum : 70%
              </p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold">
                {Object.keys(answers).length}/{quiz?.questions?.length}
              </div>
              <div className="text-primary-200 text-xs">répondu(es)</div>
            </div>
          </div>

          {/* Barre de progression quiz */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div className="h-2 bg-white rounded-full transition-all"
              style={{
                width: `${quiz?.questions?.length
                  ? (Object.keys(answers).length / quiz.questions.length) * 100
                  : 0}%`
              }}>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {quiz?.questions?.map((question, index) => (
            <div key={question.id} className={`card transition-all ${
              answers[question.id] ? 'border-primary-200' : ''
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  answers[question.id]
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {answers[question.id] ? '✓' : index + 1}
                </div>
                <p className="font-medium text-gray-800 pt-1">{question.questionText}</p>
              </div>

              <div className="space-y-2 ml-11">
                {question.options?.map((option) => (
                  <button key={option.id}
                    onClick={() => handleAnswer(question.id, option.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                      answers[question.id] === option.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                        : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 text-gray-600'
                    }`}>
                    <span className={`inline-flex w-6 h-6 rounded-full border-2 mr-3 items-center justify-center text-xs ${
                      answers[question.id] === option.id
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {answers[question.id] === option.id ? '●' : ''}
                    </span>
                    {option.optionText}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bouton soumettre */}
        <div className="mt-6 flex justify-end">
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary px-10 py-3 text-base disabled:opacity-50">
            {submitting ? 'Correction en cours...' : 'Soumettre le quiz →'}
          </button>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default QuizPage;