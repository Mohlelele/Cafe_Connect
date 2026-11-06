import { useMemo, useState } from 'react';

const categories = ['All', 'Burgers', 'Pizza', 'Meals', 'Drinks'];

const getItemCategory = (item) => {
  const name = (item.name || '').toLowerCase();

  if (name.includes('burger')) {
    return 'Burgers';
  }

  if (name.includes('pizza')) {
    return 'Pizza';
  }

  if (name.includes('wrap') || name.includes('chicken bucket') || name.includes('curry') || name.includes('meal') || name.includes('pie') || name.includes('fries') || name.includes('loaded')) {
    return 'Meals';
  }

  if (name.includes('juice') || name.includes('coffee') || name.includes('latte') || name.includes('cappuccino')) {
    return 'Drinks';
  }

  return 'Meals';
};

const getFallbackImage = (item) => {
  const category = getItemCategory(item);

  const categoryImages = {
    Burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    Pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    Meals: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    Drinks: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
  };

  return categoryImages[category] || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80';
};

function MenuPage({ navigate, addToCart, menuItems = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(true);
  const [cartPopupItem, setCartPopupItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!menuItems.length) return [];

    const visibleItems = menuItems.filter((item) => item.available !== false);
    const keyword = searchTerm.trim().toLowerCase();

    const itemsByCategory = selectedCategory === 'All'
      ? visibleItems
      : visibleItems.filter((item) => getItemCategory(item) === selectedCategory);

    if (!keyword) return itemsByCategory;

    return itemsByCategory.filter((item) => {
      const searchableText = [
        item.name,
        item.description,
        getItemCategory(item),
      ].join(' ').toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [menuItems, selectedCategory, searchTerm]);

  const handleAddToCart = (item) => {
    if (item.available === false) {
      return;
    }

    addToCart(item);
    setCartPopupItem(item);
  };

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

        <div className="category-section-title">Coming soon</div>
        <div className="category-list compact">
          {['Ice Cream', 'Pie', 'Meat', 'Burgers', 'Pizza', 'Drinks'].map((item) => (
            <div key={item} className="category-pill light static">
              {item}
            </div>
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
          <input
            type="text"
            className="search-box"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by food name, category, or keyword..."
            aria-label="Search menu items"
          />
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

        {filteredItems.length === 0 ? (
          <div className="empty-menu-state">
            <h3>No items found</h3>
            <p>Try a different keyword, category, or search term.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <article className="food-card" key={item.id}>
                <div className="food-image-wrap">
                  <span className="food-badge">Popular</span>
                  <img src={item.image || item.image_url || getFallbackImage(item)} alt={item.name} className="food-image" />
                </div>

              <div className="food-card-content">
                <div className="food-name-row">
                  <div className="food-name">{item.name}</div>
                  <div className="food-rating">★★★★★</div>
                </div>

                <div className="food-price-row">
                  <div className="food-price">R {Number(item.price || 0).toFixed(2)}</div>
                  <div className="food-price-compare">R {(Number(item.price || 0) + 12).toFixed(2)}</div>
                </div>

                  <div className="food-action-row">
                    <button type="button" className="add-cart-btn" onClick={() => handleAddToCart(item)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {cartPopupItem && (
          <div className="cart-popup-backdrop" onClick={() => setCartPopupItem(null)}>
            <div className="cart-popup" onClick={(event) => event.stopPropagation()}>
              <div className="cart-popup-tag">Added to cart</div>
              <h3>{cartPopupItem.name}</h3>
              <p>{cartPopupItem.description}</p>
              <div className="cart-popup-row">
                <span>Price</span>
                <strong>R {Number(cartPopupItem.price || 0).toFixed(2)}</strong>
              </div>
              <div className="cart-popup-actions">
                <button type="button" className="secondary-btn small" onClick={() => setCartPopupItem(null)}>Keep shopping</button>
                <button type="button" className="primary-btn small" onClick={() => { setCartPopupItem(null); navigate('/cart'); }}>View order</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenuPage;
