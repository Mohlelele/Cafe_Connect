import { useState } from 'react';
import { apiRequest } from '../api';

function ForgotPasswordPage({ navigate, showMessage }) {
  const [form, setForm] = useState({ email: '', newPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRequestOtp = async () => {
    if (!form.email.trim()) {
      showMessage('Please enter your email before continuing.', 'error');
      return;
    }

    try {
      const payload = await apiRequest('/api/forgot-password/request', {
        method: 'POST',
        body: JSON.stringify({ email: form.email }),
      });
      showMessage(payload.message || 'You can now set a new password for this account.', 'success');
    } catch (error) {
      showMessage(error.message || 'Could not continue with password reset.', 'error');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.newPassword.trim()) {
      showMessage('Please provide your email and a new password.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = await apiRequest('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      showMessage(payload.message || 'Password reset successful.', 'success');
      navigate('/login');
    } catch (error) {
      showMessage(error.message || 'Password reset failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canRequestOtp = form.email.trim().length > 0 && !isSubmitting;
  const canSubmitReset = form.email.trim().length > 0 && form.newPassword.trim().length > 0 && !isSubmitting;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="form-field">
            Email
            <input className="form-input" type="email" name="email" placeholder="student@example.com" value={form.email} onChange={handleChange} />
          </label>

          <button type="button" className="secondary-btn" onClick={handleRequestOtp} disabled={!canRequestOtp}>
            Check account
          </button>

          <label className="form-field">
            New password
            <input className="form-input" type="password" name="newPassword" placeholder="Enter a new password" value={form.newPassword} onChange={handleChange} />
          </label>

          <button type="submit" className="primary-btn" disabled={!canSubmitReset}>
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
