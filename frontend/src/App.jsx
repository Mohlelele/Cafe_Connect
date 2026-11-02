import { useEffect, useMemo, useState } from 'react';
import { BellIcon, ClockIcon, LogoIcon, MenuIcon, UserIcon, ArrowRightIcon } from './components/Icons';
import menuItemsData from './data/menu';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import CartPage from './pages/CartPage';

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');
  const [cart, setCart] = useState([]);
  const isAdminView = currentPath.startsWith('/admin');

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname || '/');
    window.addEventListener('popstate', handleLocationChange);

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const addToCart = (item, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry
        );
      }
      return [...current, { ...item, quantity }];
    });
  };

  const updateCartItem = (id, delta) => {
    setCart((current) =>
      current
        .map((entry) =>
          entry.id === id ? { ...entry, quantity: Math.max(0, entry.quantity + delta) } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const cartCount = useMemo(
    () => cart.reduce((total, entry) => total + entry.quantity, 0),
    [cart]
  );

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const renderPage = () => {
    if (currentPath === '/menu') return <MenuPage navigate={navigate} addToCart={addToCart} cartCount={cartCount} />;
    if (currentPath === '/orders') return <OrdersPage navigate={navigate} cart={cart} />;
    if (currentPath === '/about') return <AboutPage navigate={navigate} />;
    if (currentPath === '/announcements') return <AnnouncementsPage navigate={navigate} />;
    if (currentPath === '/cart') return <CartPage cart={cart} navigate={navigate} updateCartItem={updateCartItem} />;
    if (currentPath === '/login') return <LoginPage navigate={navigate} />;
    if (currentPath === '/register') return <RegisterPage navigate={navigate} />;
    if (currentPath === '/admin') return <AdminPage navigate={navigate} />;
    return <HomePage navigate={navigate} menuItems={menuItemsData} addToCart={addToCart} />;
  };

  const renderHeader = () => {
    if (isAdminView) {
      return (
        <header className="main-header admin-header">
          <div className="brand-block" onClick={() => navigate('/admin')} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate('/admin'); }}>
            <div className="logo-mark"><LogoIcon className="logo-svg" /></div>
            <div className="brand-copy">
              <div className="brand-title">Cafe Connect</div>
            </div>
          </div>

          <nav className="main-nav admin-nav" aria-label="Admin navigation">
            <button type="button" className={currentPath === '/admin' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/admin')}>
              <span className="nav-label">Dashboard</span>
            </button>
            <button type="button" className="nav-item" onClick={() => navigate('/menu')}>
              <span className="nav-label">View Menu</span>
            </button>
            <button type="button" className="nav-item" onClick={() => navigate('/')}>
              <span className="nav-label">Customer View</span>
            </button>
          </nav>

          <div className="header-actions">
            <button type="button" className="user-pill" onClick={() => navigate('/')}>
              <span className="user-avatar">A</span>
              <span className="user-label">Admin</span>
              <ArrowRightIcon className="user-arrow" />
            </button>
          </div>
        </header>
      );
    }

    return (
      <header className="main-header">
        <div className="brand-block" onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') navigate('/'); }}>
          <div className="logo-mark"><LogoIcon className="logo-svg" /></div>
          <div className="brand-copy">
            <div className="brand-title">Cafe Connect</div>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <button type="button" className={currentPath === '/' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/')}>
            <span className="nav-label">Home</span>
          </button>

          <button type="button" className={currentPath === '/menu' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/menu')}>
            <MenuIcon className="nav-icon" />
            <span className="nav-label">Menu</span>
          </button>

          <button type="button" className={currentPath === '/orders' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/orders')}>
            <ClockIcon className="nav-icon" />
            <span className="nav-label">My Orders</span>
            <span className="order-count">{cartCount || 1}</span>
          </button>

          <button type="button" className={currentPath === '/about' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/about')}>
            <span className="nav-icon"><BellIcon className="nav-icon" /></span>
            <span className="nav-label">About</span>
          </button>

          <button type="button" className={currentPath === '/announcements' ? 'nav-item active' : 'nav-item'} onClick={() => navigate('/announcements')}>
            <span className="nav-label">Announcements</span>
          </button>
        </nav>

        <div className="header-actions">
          <button type="button" className="cart-pill" onClick={() => navigate('/cart')}>
            <span className="cart-icon-wrap">
              <span className="cart-number">{cartCount}</span>
              <span className="cart-symbol">🛒</span>
            </span>
          </button>

          <button type="button" className="user-pill" onClick={() => navigate('/login')}>
            <span className="user-avatar">J</span>
            <span className="user-label">John Doe</span>
            <ArrowRightIcon className="user-arrow" />
          </button>
        </div>
      </header>
    );
  };

  return (
    <div className="app-shell">
      {renderHeader()}
      <main className="page-content">{renderPage()}</main>
    </div>
  );
}

export default App;
