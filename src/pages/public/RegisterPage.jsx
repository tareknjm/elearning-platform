import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'LEARNER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register(form);
      login(data);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else navigate('/learner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow mx-auto mb-3">
            <span className="text-white font-bold text-lg">EL</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez notre communauté d'apprenants</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
              <input type="text" name="name" value={form.name}
                onChange={handleChange} required className="input"
                placeholder="Ahmed Benali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} required className="input"
                placeholder="vous@exemple.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} required className="input"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Je suis</label>
              <select name="role" value={form.role} onChange={handleChange} className="input">
                <option value="LEARNER">🎓 Apprenant</option>
              </select>
              <p className="text-xs mt-2" style={{ color: 'rgba(99,102,241,0.8)' }}>
                Vous souhaitez enseigner ?{' '}
                <Link to="/become-instructor"
                  className="font-semibold hover:underline"
                  style={{ color: '#6366f1' }}>
                  Soumettre une candidature →
                </Link>
              </p>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50">
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;