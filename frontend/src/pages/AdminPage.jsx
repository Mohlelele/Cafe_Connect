import { useMemo, useRef, useState } from 'react';
import { ClipboardIcon, UtensilsIcon, WalletIcon } from '../components/Icons';
import menuItemsData from '../data/menu';

const defaultOrders = [
  { id: '#CC-1024', customer: 'Aisha N.', item: 'Chicken Burger', total: 650, status: 'Prep' },
  { id: '#CC-1025', customer: 'Daniel K.', item: 'Rice & Curry', total: 420, status: 'Ready' },
  { id: '#CC-1026', customer: 'Lilian M.', item: 'Fruit Smoothie', total: 280, status: 'Paid' },
  { id: '#CC-1027', customer: 'James O.', item: 'Cheese Pizza', total: 760, status: 'Prep' },
];

const initialForm = {
  name: '',
  description: '',
  price: '',
};

function AdminPage({ navigate }) {
  const [menuItems, setMenuItems] = useState(
    menuItemsData.map((item) => ({ ...item, available: true }))
  );
  const [orders, setOrders] = useState(defaultOrders);
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState('Live Orders Queue');
  const menuFormRef = useRef(null);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const readyCount = orders.filter((order) => order.status === 'Ready').length;
    const pendingCount = orders.filter((order) => order.status === 'Prep').length;
    const activeItems = menuItems.filter((item) => item.available).length;

    return [
      { label: 'Total sales (ZAR)', value: `R ${revenue.toFixed(2)}`, icon: <WalletIcon />, tone: 'turquoise' },
      { label: 'Pending orders', value: String(pendingCount), icon: <ClipboardIcon />, tone: 'orange' },
      { label: 'Active menu items', value: String(activeItems), icon: <UtensilsIcon />, tone: 'blue' },
    ];
  }, [menuItems, orders]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddMenuItem = (event) => {
    event.preventDefault();

    if (!form.name || !form.description || !form.price) {
      return;
    }

    const newItem = {
      id: Date.now(),
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      available: true,
    };

    setMenuItems((current) => [newItem, ...current]);
    setForm(initialForm);
    setActiveTab('Manage Menu & Prices');
  };

  const focusAddItemForm = () => {
    menuFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const input = menuFormRef.current?.querySelector('input[name="name"]');
    input?.focus();
  };

  const toggleItemAvailability = (id) => {
    setMenuItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const updateOrderStatus = (id, nextStatus) => {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status: nextStatus } : order))
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-copy">
          <div className="admin-tag">Admin operations</div>
          <h1>Richfield Campus</h1>
        </div>
        <button type="button" className="primary-btn hero-action" onClick={focusAddItemForm}>
          + Add New Item
        </button>
      </div>

      <section className="admin-main-panel">
        <div className="hero-topline">
          <div className="admin-tag">Admin operations</div>
          <div className="location-badge">Richfield Campus</div>
        </div>

        <h1 className="hero-title">Cafeteria Dashboard</h1>
      </section>

      <div className="hero-subgrid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-icon ${stat.tone}`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        {['Live Orders Queue', 'Manage Menu & Prices', 'Banner Announcements'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'tab-item active' : 'tab-item'}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="admin-layout">
        <section className="admin-panel">
          <div className="section-header">
            <h2 className="section-title">Incoming Student Orders</h2>
            <p className="section-subtitle">Update status to notify student</p>
          </div>

          <div className="order-list">
            {orders.map((order) => (
              <div className="order-row" key={order.id}>
                <strong>{order.id}</strong>
                <span>{order.customer}</span>
                <span>{order.item}</span>
                <div>
                  <span className={`status-pill ${
                    order.status === 'Prep'
                      ? 'prep'
                      : order.status === 'Ready'
                        ? 'ready'
                        : 'paid'
                  }`}>{order.status}</span>
                </div>
                <span>KSh {order.total}</span>
                <select
                  value={order.status}
                  onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  className="status-select"
                  aria-label={`Update status for ${order.id}`}
                >
                  <option value="Prep">Prep</option>
                  <option value="Ready">Ready</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            ))}
          </div>
        </section>

        <aside className="admin-panel">
          <div className="section-header">
            <h2 className="section-title">Menu inventory</h2>
          </div>

          <div className="menu-list">
            {menuItems.map((item) => (
              <div className="menu-table-row" key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.available ? 'Available' : 'Hidden'}</span>
                <span>R {item.price}</span>
                <button type="button" className="small-action" onClick={() => toggleItemAvailability(item.id)}>
                  {item.available ? 'Hide' : 'Show'}
                </button>
              </div>
            ))}
          </div>

          <form ref={menuFormRef} className="admin-form" onSubmit={handleAddMenuItem}>
            <h3>Add menu item</h3>
            <input
              type="text"
              name="name"
              placeholder="Item name"
              value={form.name}
              onChange={handleFormChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleFormChange}
              rows="3"
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={form.price}
              onChange={handleFormChange}
            />
            <button type="submit" className="primary-btn">Save item</button>
          </form>
        </aside>
      </div>
    </div>
  );
}

export default AdminPage;
