import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { dark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={dark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      className="p-2 rounded-xl transition"
      style={{
        background: dark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.15)',
      }}>
      {dark ? (
        // Soleil (mode clair)
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"
          stroke="#fbbf24" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        // Lune (mode sombre)
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"
          stroke="#6366f1" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;