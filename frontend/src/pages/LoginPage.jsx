import { useState } from 'react';
import { apiRequest } from '../api';

function LoginPage({ navigate, onLogin, showMessage }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (payload.token) {
        localStorage.setItem('cafe-connect-auth-token', payload.token);
      }
      onLogin(payload.user, payload.token);
      showMessage(payload.message || 'Login successful.', 'success');
      navigate('/menu');
    } catch (error) {
      showMessage(error.message || 'Login failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Student Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            Email
            <input className="form-input" type="email" name="email" placeholder="student@example.com" value={form.email} onChange={handleChange} required />
          </label>

          <label className="form-field">
            Password
            <input className="form-input" type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} required />
          </label>

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link-row">
          <button type="button" className="inline-link" onClick={() => navigate('/forgot-password')}>
            Forgot password?
          </button>
        </p>

        <p className="auth-link-row">
          Don’t have an account?{' '}
          <button type="button" className="inline-link" onClick={() => navigate('/register')}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
