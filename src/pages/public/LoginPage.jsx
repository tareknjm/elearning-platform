import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginService(form);
      login(data);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else navigate('/learner/dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow mx-auto mb-3">
              <span className="text-white font-bold text-lg">EL</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bon retour !</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte</p>
        </div>

        <div className="card shadow-soft">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-50">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              S'inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;