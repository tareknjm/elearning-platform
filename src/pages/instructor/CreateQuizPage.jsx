import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';
import InstructorLayout from '../../components/layouts/InstructorLayout';
const CreateQuizPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Quiz final');
  const [questions, setQuestions] = useState([
    { questionText: '', options: [
      { optionText: '', correct: false },
      { optionText: '', correct: false },
      { optionText: '', correct: false },
      { optionText: '', correct: false },
    ]}
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      options: [
        { optionText: '', correct: false },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
        { optionText: '', correct: false },
      ]
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, text) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, text) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].optionText = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((o, i) => ({
      ...o, correct: i === oIndex
    }));
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    setError('');
    // Validation
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setError(`Question ${i + 1} est vide`);
        return;
      }
      const hasCorrect = questions[i].options.some(o => o.correct);
      if (!hasCorrect) {
        setError(`Question ${i + 1} : sélectionnez la bonne réponse`);
        return;
      }
      const hasEmpty = questions[i].options.some(o => !o.optionText.trim());
      if (hasEmpty) {
        setError(`Question ${i + 1} : toutes les options doivent être remplies`);
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('/instructor/quiz', {
        title,
        courseId: Number(courseId),
        questions
      });
      setSuccess('Quiz créé avec succès !');
      setTimeout(() => navigate('/instructor/dashboard'), 1500);
    } catch (err) {
      setError('Erreur lors de la création du quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)}
          className="text-primary-600 hover:underline mb-6 block text-sm">
          ← Retour
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer le quiz final</h1>
        <p className="text-gray-500 mb-6">
          Les apprenants doivent obtenir 70% pour recevoir leur certificat
        </p>

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

        {/* Titre du quiz */}
        <div className="card mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Titre du quiz
          </label>
          <input type="text" value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input" placeholder="Ex: Quiz final - Spring Boot" />
        </div>

        {/* Questions */}
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {qIndex + 1}
                </div>
                <span className="font-semibold text-gray-700">Question {qIndex + 1}</span>
              </div>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qIndex)}
                  className="text-red-400 hover:text-red-600 text-sm transition">
                  Supprimer
                </button>
              )}
            </div>

            <textarea
              value={question.questionText}
              onChange={(e) => updateQuestion(qIndex, e.target.value)}
              className="input resize-none mb-4"
              rows={2}
              placeholder="Saisissez votre question..." />

            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
              Options (cliquez sur ● pour marquer la bonne réponse)
            </p>

            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition ${
                  option.correct
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-100 bg-gray-50'
                }`}>
                  <button
                    onClick={() => setCorrectOption(qIndex, oIndex)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      option.correct
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-400'
                    }`}>
                    {option.correct && '✓'}
                  </button>
                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700"
                    placeholder={`Option ${oIndex + 1}`} />
                  {option.correct && (
                    <span className="text-xs text-emerald-600 font-medium">✓ Correcte</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button onClick={addQuestion}
            className="btn-secondary flex-1 py-3">
            + Ajouter une question
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary flex-1 py-3 disabled:opacity-50">
            {loading ? 'Création...' : '🚀 Créer le quiz'}
          </button>
        </div>
      </div>
    </InstructorLayout>
  );
};

export default CreateQuizPage;