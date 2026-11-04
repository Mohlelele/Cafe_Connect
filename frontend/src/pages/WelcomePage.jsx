import { ArrowRightIcon, LogoIcon, UserIcon } from '../components/Icons';

function ShieldIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 18.5 6v5.5c0 4.2-2.6 7.9-6.5 9.2-3.9-1.3-6.5-5-6.5-9.2V6L12 3.5Z" />
      <path d="M9.5 12.2 11.2 14l3.3-4.2" />
    </svg>
  );
}

function WelcomePage({ navigate }) {
  const roleCards = [
    {
      type: 'student',
      title: 'Student',
      description: 'Browse meals, place orders and track your purchases.',
      action: 'Student Login',
      icon: <UserIcon className="role-icon" />,
      onClick: () => navigate('/login'),
    },
    {
      type: 'admin',
      title: 'Administrator',
      description: 'Manage students, food menus, orders and payments.',
      action: 'Admin Login',
      icon: <ShieldIcon className="role-icon" />,
      onClick: () => navigate('/admin-login'),
    },
  ];

  return (
    <div className="welcome-page-shell">
      <div className="welcome-hero">
        <div className="welcome-brand">
          <div className="welcome-logo">
            <LogoIcon className="welcome-logo-svg" />
          </div>
          <div>
            <div className="welcome-brand-name">Cafe Connect</div>
          </div>
        </div>

        <div className="welcome-tagline">Order ahead. Skip the queue. Enjoy your meal.</div>

        <div className="welcome-copy">
          <h1>Welcome to Cafe Connect</h1>
          <p>
            Cafe Connect helps students order campus meals quickly, pay securely, and track their orders from
            selection to collection.
          </p>
        </div>

        <div className="role-grid">
          {roleCards.map((card) => (
            <div key={card.type} className="role-card">
              <div className="role-icon-wrap">{card.icon}</div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <button type="button" className="primary-btn role-btn" onClick={card.onClick}>
                {card.action}
                <ArrowRightIcon className="role-arrow" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
