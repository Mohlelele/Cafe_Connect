import { useState } from 'react';
import { apiRequest } from '../api';

function ForgotPasswordPage({ navigate, showMessage }) {
  const [form, setForm] = useState({ email: '', otp: '', newPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRequestOtp = async () => {
    if (!form.email.trim()) {
      showMessage('Please enter your email before requesting an OTP.', 'error');
      return;
    }

    try {
      const payload = await apiRequest('/api/forgot-password/request', {
        method: 'POST',
        body: JSON.stringify({ email: form.email }),
      });
      setOtpSent(true);
      showMessage(payload.message || 'OTP sent.', 'success');
    } catch (error) {
      showMessage(error.message || 'Could not send OTP.', 'error');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.otp.trim() || !form.newPassword.trim()) {
      showMessage('Please provide your email, OTP, and new password.', 'error');
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
  const canSubmitReset = otpSent && form.otp.trim().length > 0 && form.newPassword.trim().length > 0 && !isSubmitting;

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
            Send OTP
          </button>

          <label className="form-field">
            OTP code
            <input className="form-input" type="text" name="otp" inputMode="numeric" maxLength="6" placeholder="Enter 6-digit code" value={form.otp} onChange={handleChange} />
          </label>

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
