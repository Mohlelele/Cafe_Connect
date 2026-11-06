import { useState } from 'react';
import { apiRequest } from '../api';

function ForgotPasswordPage({ navigate, showMessage }) {
  const [form, setForm] = useState({ email: '', newPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email.trim();
    const newPassword = form.newPassword.trim();

    if (!email || !newPassword) {
      showMessage('Please enter your email and a new password.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await apiRequest('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      });

      showMessage(payload.message || 'Password reset successful.', 'success');
      navigate('/login');
    } catch (error) {
      showMessage(error.message || 'Password reset failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            Email
            <input className="form-input" type="email" name="email" placeholder="student@example.com" value={form.email} onChange={handleChange} required />
          </label>

          <label className="form-field">
            New password
            <input className="form-input" type="password" name="newPassword" placeholder="Enter a new password" value={form.newPassword} onChange={handleChange} required />
          </label>

          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <p className="auth-link-row">
          <button type="button" className="inline-link" onClick={() => navigate('/login')}>
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
