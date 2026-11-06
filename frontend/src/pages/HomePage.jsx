import { ClipboardIcon, UtensilsIcon, WalletIcon } from '../components/Icons';

function HomePage({ navigate, menuItems, addToCart }) {
  const featured = Array.isArray(menuItems) ? menuItems.filter(Boolean).slice(0, 3) : [];
  const heroImage = featured[0]?.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80';

  return (
    <div className="home-page">
      <section className="hero-banner">
        <div className="hero-copy">
          <span className="hero-tag">Fresh campus meals</span>
          <h1>Enjoy your food in the heart of campus.</h1>
          <p>Order quick bites, warm meals, drinks, and desserts from the cafe with a few taps.</p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => navigate('/menu')}>Order now</button>
            <button type="button" className="secondary-btn" onClick={() => navigate('/about')}>About us</button>
          </div>
        </div>

        <div className="hero-visual">
          <img src={heroImage} alt="Cafe Connect feature" />
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-card">
          <div className="stat-label">Daily sales</div>
          <div className="stat-value">R 58.00</div>
          <div className="stat-icon turquoise"><WalletIcon /></div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Ready orders</div>
          <div className="stat-value">0</div>
          <div className="stat-icon orange"><ClipboardIcon /></div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Menu items</div>
          <div className="stat-value">13</div>
          <div className="stat-icon blue"><UtensilsIcon /></div>
        </div>
      </div>

      <div className="featured-wrap">
        <div className="section-head">
          <h2>Coming soon</h2>
          <button type="button" className="chip-button" onClick={() => navigate('/menu')}>View menu</button>
        </div>

        <div className="coming-soon-card">
          <h3>Fresh menu updates are on the way.</h3>
          <p>Look out for ice cream, pie, meat, burgers, pizza, and drinks.</p>
          <div className="soon-tag-list">
            {['Ice cream', 'Pie', 'Meat', 'Burgers', 'Pizza', 'Drinks'].map((item) => (
              <span key={item} className="soon-tag">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
