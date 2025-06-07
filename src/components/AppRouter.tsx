import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

const AppRouter: React.FC = () => {
  const [auth, setAuth] = useState(localStorage.getItem('isAuthenticated') === 'true');

  useEffect(() => {
    const onStorage = () => setAuth(localStorage.getItem('isAuthenticated') === 'true');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Also update on same-tab login
  useEffect(() => {
    const interval = setInterval(() => {
      setAuth(localStorage.getItem('isAuthenticated') === 'true');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={auth ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
export {};