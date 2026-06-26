import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const userId = localStorage.getItem('userId');
  const plan = localStorage.getItem('plan') || 'FREE';
  const planExpiresAt = localStorage.getItem('planExpiresAt') || null;
  return token ? { token, role, name, userId, plan, planExpiresAt } : null;
});

const login = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.role);
  localStorage.setItem('name', data.name);
  localStorage.setItem('userId', String(data.userId));
  localStorage.setItem('plan', data.plan || 'FREE');
  localStorage.setItem('planExpiresAt', data.planExpiresAt || '');
  setUser({ ...data, plan: data.plan || 'FREE' });
};

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    if (updates.plan) localStorage.setItem('plan', updates.plan);
    setUser(updated);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);