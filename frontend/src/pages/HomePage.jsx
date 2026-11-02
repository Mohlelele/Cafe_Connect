import { ClipboardIcon, UtensilsIcon, WalletIcon } from '../components/Icons';

function HomePage({ navigate, menuItems, addToCart }) {
  const featured = menuItems.slice(0, 3);

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
          <img src={featured[0].image} alt={featured[0].name} />
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
          <h2>Popular picks</h2>
          <button type="button" className="chip-button" onClick={() => navigate('/menu')}>View menu</button>
        </div>

        <div className="featured-grid">
          {featured.map((item) => (
            <article className="feature-card" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="feature-card-body">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="feature-price-row">
                  <strong>R {item.price.toFixed(2)}</strong>
                  <button type="button" className="small-orange" onClick={() => addToCart(item)}>Add</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
