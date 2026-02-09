import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setAdmin } from '../../routes/ProtectedRoute';

const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/admin/dashboard';

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAdmin(true);
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password');
    }
  }

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-box cyber-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="admin-login-title">Admin</h1>
        <p className="admin-login-subtitle">Sign in to edit portfolio</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="admin-input"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
            autoComplete="current-password"
          />
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn">Login</button>
        </form>
      </motion.div>
    </div>
  );
}
