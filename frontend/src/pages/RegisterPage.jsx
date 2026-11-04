import { useState } from 'react';
import { apiRequest } from '../api';

function RegisterPage({ navigate, onRegister, showMessage }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      onRegister(payload.student, payload.token || '');
      showMessage(payload.message || 'Account created successfully.', 'success');
      navigate('/login');
    } catch (error) {
      showMessage(error.message || 'Registration failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            Full name
            <input className="form-input" type="text" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="form-field">
            Email
            <input className="form-input" type="email" name="email" placeholder="student@example.com" value={form.email} onChange={handleChange} required />
          </label>

          <label className="form-field">
            Password
            <input className="form-input" type="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
          </label>

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link-row">
          Already have an account?{' '}
          <button type="button" className="inline-link" onClick={() => navigate('/login')}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
