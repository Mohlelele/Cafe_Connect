function LoginPage({ navigate }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/menu');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Student Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            Email
            <input className="form-input" type="email" placeholder="student@example.com" />
          </label>

          <label className="form-field">
            Password
            <input className="form-input" type="password" placeholder="Enter your password" />
          </label>

          <button type="submit" className="primary-btn">Login</button>
        </form>

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
