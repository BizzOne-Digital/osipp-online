import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, isAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuth) return <Navigate to="/admin" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="adm-login-page">
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <div className="adm-login-brand">
          <img
            src="/images/logo.png"
            alt="O'SIPP Delivery"
            style={{ height: 72, width: 'auto', objectFit: 'contain', margin: '0 auto 14px', display: 'block' }}
          />
          <div className="adm-login-title">Admin Panel</div>
          <div className="adm-login-sub">O'SIPP Delivery Management</div>
        </div>

        {error && <div className="adm-login-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@osipp.ca" required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required />
        </div>
        <button className="adm-login-btn" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Dashboard'}
        </button>
        <div className="adm-login-hint">Demo: admin@osipp.ca / osipp2024</div>
      </form>
    </div>
  );
}
