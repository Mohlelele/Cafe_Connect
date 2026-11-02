function RegisterPage({ navigate }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/menu');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            Full name
            <input className="form-input" type="text" placeholder="Enter your name" />
          </label>

          <label className="form-field">
            Email
            <input className="form-input" type="email" placeholder="student@example.com" />
          </label>

          <label className="form-field">
            Password
            <input className="form-input" type="password" placeholder="Create a password" />
          </label>

          <button type="submit" className="primary-btn">Register</button>
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
