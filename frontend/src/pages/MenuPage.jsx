import { useMemo, useState } from 'react';

const categories = ['All', 'Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Specials'];

const getItemCategory = (item) => {
  const name = item.name.toLowerCase();

  if (name.includes('pizza') || name.includes('burger') || name.includes('rice') || name.includes('curry')) {
    return 'Main Course';
  }

  if (name.includes('smoothie') || name.includes('tea') || name.includes('coffee') || name.includes('drink')) {
    return 'Beverages';
  }

  if (name.includes('fries') || name.includes('dip') || name.includes('salad')) {
    return 'Appetizers';
  }

  return 'Specials';
};

function MenuPage({ navigate, addToCart, menuItems = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(true);

  const filteredItems = useMemo(() => {
    if (!menuItems.length) return [];
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter((item) => getItemCategory(item) === selectedCategory);
  }, [menuItems, selectedCategory]);

  return (
    <div className="menu-page-shell">
      <aside className="category-sidebar" style={{ display: showFilters ? 'block' : 'none' }}>
        <div className="mini-brand">
          <div className="mini-brand-mark">☕</div>
          <div>
            <div className="mini-brand-name">Cafe</div>
            <div className="mini-brand-sub">Main menu</div>
          </div>
        </div>

        <div className="category-list">
          {['Veg. Mania', 'Sandwich', 'Club Veg.', 'Veg. Pizza'].map((item) => (
            <button
              type="button"
              key={item}
              className={selectedCategory === item ? 'category-pill active' : 'category-pill'}
              onClick={() => setSelectedCategory(item === 'Veg. Mania' ? 'Main Course' : item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="category-section-title">Appetizer</div>
        <div className="category-list compact">
          {['Burger', 'Macaroni', 'French Fries'].map((item) => (
            <button
              type="button"
              className={selectedCategory === 'Appetizers' ? 'category-pill light active' : 'category-pill light'}
              key={item}
              onClick={() => setSelectedCategory('Appetizers')}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="category-section-title">Beverages</div>
        <div className="category-list compact">
          {['Hot-Coffee', 'Ice-Tea'].map((item) => (
            <button
              type="button"
              className={selectedCategory === 'Beverages' ? 'category-pill light active' : 'category-pill light'}
              key={item}
              onClick={() => setSelectedCategory('Beverages')}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="brand-footer">
          <div className="brand-footer-mark">🍔</div>
          <div>
            <div className="brand-footer-name">FoodHub</div>
            <div className="brand-footer-sub">Digital Menu &amp; Ordering</div>
          </div>
        </div>
      </aside>

      <div className="menu-main-panel">
        <div className="menu-toolbar">
          <div className="search-box">Search By Food Name...</div>
          <button type="button" className="cart-cta" onClick={() => navigate('/cart')}>Best Offer Deals</button>
        </div>

        <div className="menu-head-row">
          <div className="menu-head-title">80+ Delicious Food Menu</div>
          <button type="button" className="ghost-icon" aria-label="Toggle filters" onClick={() => setShowFilters((value) => !value)}>☰</button>
        </div>

        <div className="chip-row">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={selectedCategory === category ? 'chip active' : 'chip'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <article className="food-card" key={item.id}>
              <div className="food-image-wrap">
                <span className="food-badge">Popular</span>
                <img src={item.image} alt={item.name} className="food-image" />
              </div>

              <div className="food-card-content">
                <div className="food-name-row">
                  <div className="food-name">{item.name}</div>
                  <div className="food-rating">★★★★★</div>
                </div>

                <div className="food-price-row">
                  <div className="food-price">R {item.price.toFixed(2)}</div>
                  <div className="food-price-compare">R {item.price + 5}</div>
                </div>

                <div className="food-action-row">
                  <button type="button" className="add-cart-btn" onClick={() => addToCart(item)}>Add to Cart</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
