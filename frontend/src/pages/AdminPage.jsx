import { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardIcon, UtensilsIcon, WalletIcon } from '../components/Icons';
import { apiRequest } from '../api';

const initialForm = {
  name: '',
  description: '',
  price: '',
};

const initialStudentForm = {
  name: '',
  email: '',
  password: '',
};

const initialPasswordForm = {
  studentId: '',
  newPassword: '',
};

function AdminPage({ navigate, adminUser, setAdminUser, showMessage, menuItems: sharedMenuItems = [], setMenuItems: setSharedMenuItems }) {
  const [menuItems, setMenuItemsState] = useState(sharedMenuItems);
  const [orders, setOrders] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [activeTab, setActiveTab] = useState('Live Orders Queue');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceEdits, setPriceEdits] = useState({});
  const [loginForm, setLoginForm] = useState({ email: 'admin@cafeconnect.com', password: 'admin123' });
  const menuFormRef = useRef(null);

  const setMenuItems = (updater) => {
    const nextValue = typeof updater === 'function' ? updater(menuItems) : updater;
    setMenuItemsState(nextValue);
    if (setSharedMenuItems) {
      setSharedMenuItems(nextValue);
    }
  };

  useEffect(() => {
    setMenuItemsState(sharedMenuItems);
  }, [sharedMenuItems]);

  const loadDashboardData = async () => {
    try {
      const [menuResponse, ordersResponse, studentsResponse] = await Promise.all([
        apiRequest('/api/admin/menu'),
        apiRequest('/api/admin/orders'),
        apiRequest('/api/admin/students'),
      ]);

      const nextMenu = (menuResponse || []).map((item) => ({
        ...item,
        name: item.item_name || item.name,
        available: item.availability ?? true,
        image: item.image_url || item.image || '',
      }));

      setMenuItems(nextMenu);

      setOrders((ordersResponse || []).map((order) => ({
        id: order.order_id || order.id,
        customer: order.customer_name || order.customer || 'Student',
        item: order.item_name || (Array.isArray(order.items) && order.items.length ? order.items.map((entry) => entry.name || entry.item_name || 'item').join(', ') : 'Cafe order'),
        total: Number(order.total_amount || order.total || 0),
        status: order.order_status || order.status || 'Pending',
      })));

      setStudents(studentsResponse || []);
    } catch (error) {
      showMessage(error.message || 'Could not load admin data.', 'error');
    }
  };

  useEffect(() => {
    if (!adminUser) {
      return undefined;
    }

    loadDashboardData();
    const intervalId = window.setInterval(() => {
      loadDashboardData();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [adminUser]);

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

  const handleLoginFormChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const handleStudentFormChange = (event) => {
    const { name, value } = event.target;
    setStudentForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordFormChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      if (payload.token) {
        localStorage.setItem('cafe-connect-auth-token', payload.token);
      }
      setAdminUser(payload.admin, payload.token);
      showMessage(payload.message || 'Admin login successful.', 'success');
      navigate('/admin');
    } catch (error) {
      showMessage(error.message || 'Admin login failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMenuItem = async (event) => {
    event.preventDefault();

    if (!form.name || !form.description || !form.price) {
      showMessage('Please complete the menu item form.', 'error');
      return;
    }

    try {
      const payload = await apiRequest('/api/admin/menu', {
        method: 'POST',
        body: JSON.stringify({
          item_name: form.name,
          description: form.description,
          price: form.price,
          image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
        }),
      });

      setMenuItems((current) => [{
        id: payload.item.id,
        name: payload.item.item_name,
        item_name: payload.item.item_name,
        description: payload.item.description,
        price: Number(payload.item.price || 0),
        availability: true,
        available: true,
        image: payload.item.image_url || '',
      }, ...current]);
      setForm(initialForm);
      setActiveTab('Manage Menu & Prices');
      showMessage('Menu item added successfully.', 'success');
    } catch (error) {
      showMessage(error.message || 'Menu item creation failed.', 'error');
    }
  };

  const updateMenuPrice = async (id) => {
    const value = Number(priceEdits[id]);
    if (!Number.isFinite(value) || value <= 0) {
      showMessage('Enter a valid price greater than zero.', 'error');
      return;
    }

    try {
      const payload = await apiRequest(`/api/admin/menu/${id}/price`, {
        method: 'PATCH',
        body: JSON.stringify({ price: value }),
      });

      setMenuItems((current) => current.map((entry) => entry.id === id ? { ...entry, price: value, available: entry.available ?? true } : entry));
      setPriceEdits((current) => ({ ...current, [id]: String(value) }));
      showMessage(payload.message || 'Price updated.', 'success');
    } catch (error) {
      showMessage(error.message || 'Price update failed.', 'error');
    }
  };

  const focusAddItemForm = () => {
    menuFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const input = menuFormRef.current?.querySelector('input[name="name"]');
    input?.focus();
  };

  const toggleItemAvailability = async (id) => {
    const item = menuItems.find((entry) => entry.id === id);
    if (!item) return;

    try {
      const payload = await apiRequest(`/api/admin/menu/${id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ availability: !item.available }),
      });
      setMenuItems((current) => current.map((entry) => entry.id === id ? { ...entry, available: !entry.available, availability: !entry.availability } : entry));
      showMessage(payload.message || 'Menu item updated.', 'success');
    } catch (error) {
      showMessage(error.message || 'Failed to update menu availability.', 'error');
    }
  };

  const removeMenuItem = (id) => {
    setMenuItems((current) => current.filter((entry) => entry.id !== id));
    showMessage('Menu item removed from the list.', 'info');
  };

  const updateOrderStatus = async (id, nextStatus) => {
    try {
      const payload = await apiRequest(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status: nextStatus } : order)));
      showMessage(payload.message || 'Order status updated.', 'success');
    } catch (error) {
      showMessage(error.message || 'Status update failed.', 'error');
    }
  };

  const handleCreateStudent = async (event) => {
    event.preventDefault();

    if (!studentForm.name || !studentForm.email || !studentForm.password) {
      showMessage('Student details are required.', 'error');
      return;
    }

    try {
      const payload = await apiRequest('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify(studentForm),
      });
      setStudents((current) => [payload.student, ...current]);
      setStudentForm(initialStudentForm);
      showMessage(payload.message || 'Student account created.', 'success');
    } catch (error) {
      showMessage(error.message || 'Student creation failed.', 'error');
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!passwordForm.studentId || !passwordForm.newPassword) {
      showMessage('Select a student and enter a new password.', 'error');
      return;
    }

    try {
      const payload = await apiRequest(`/api/admin/students/${passwordForm.studentId}/reset-password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
      });
      setPasswordForm(initialPasswordForm);
      showMessage(payload.message || 'Password reset.', 'success');
    } catch (error) {
      showMessage(error.message || 'Password reset failed.', 'error');
    }
  };

  const handleLogout = () => {
    setAdminUser(null);
    showMessage('Admin logged out.', 'info');
    navigate('/admin');
  };

  if (!adminUser) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 className="auth-title">Admin Login</h2>
          <form className="auth-form" onSubmit={handleAdminLogin}>
            <label className="form-field">
              Email
              <input className="form-input" type="email" name="email" value={loginForm.email} onChange={handleLoginFormChange} required />
            </label>

            <label className="form-field">
              Password
              <input className="form-input" type="password" name="password" value={loginForm.password} onChange={handleLoginFormChange} required />
            </label>
            <p className="helper-text">Passwords are case sensitive.</p>

            <button type="submit" className="primary-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Admin Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-copy">
          <div className="admin-tag">Admin operations</div>
          <h1>Richfield Campus</h1>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="secondary-btn" onClick={handleLogout}>Logout</button>
          <button type="button" className="primary-btn hero-action" onClick={focusAddItemForm}>+ Add New Item</button>
        </div>
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
        {['Live Orders Queue', 'Manage Menu & Prices', 'Student Accounts'].map((tab) => (
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
            {orders.length === 0 ? (
              <p className="empty-state-copy">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div className="order-row" key={order.id}>
                  <strong>{`#${order.id}`}</strong>
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
                  <span>R {Number(order.total || 0).toFixed(2)}</span>
                  <select
                    value={order.status}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                    className="status-select"
                    aria-label={`Update status for #${order.id}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Prep">Prep</option>
                    <option value="Ready">Ready</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="admin-panel">
          {activeTab === 'Manage Menu & Prices' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Menu inventory</h2>
              </div>

              <div className="menu-list">
                {menuItems.map((item) => (
                  <div className="menu-table-row" key={item.id}>
                    <strong>{item.name}</strong>
                    <span>{item.available === false ? 'Unavailable' : 'Available'}</span>
                    <div className="menu-price-editor">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={priceEdits[item.id] ?? Number(item.price || 0)}
                        onChange={(event) => setPriceEdits((current) => ({ ...current, [item.id]: event.target.value }))}
                        aria-label={`Edit price for ${item.name}`}
                      />
                      <button type="button" className="small-action" onClick={() => updateMenuPrice(item.id)}>
                        Save
                      </button>
                    </div>
                    <div className="menu-row-actions">
                      <button type="button" className="small-action" onClick={() => toggleItemAvailability(item.id)}>
                        {item.available === false ? 'Show' : 'Hide'}
                      </button>
                      <button type="button" className="small-action danger" onClick={() => removeMenuItem(item.id)}>
                        Remove
                      </button>
                    </div>
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
            </>
          )}

          {activeTab === 'Student Accounts' && (
            <>
              <div className="section-header">
                <h2 className="section-title">Student accounts</h2>
              </div>

              <form className="admin-form" onSubmit={handleCreateStudent}>
                <h3>Create student account</h3>
                <input type="text" name="name" placeholder="Full name" value={studentForm.name} onChange={handleStudentFormChange} />
                <input type="email" name="email" placeholder="Email" value={studentForm.email} onChange={handleStudentFormChange} />
                <input type="text" name="password" placeholder="Temporary password" value={studentForm.password} onChange={handleStudentFormChange} />
                <button type="submit" className="primary-btn">Create student</button>
              </form>

              <form className="admin-form" onSubmit={handleResetPassword}>
                <h3>Reset student password</h3>
                <select name="studentId" value={passwordForm.studentId} onChange={handlePasswordFormChange}>
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>{student.name} - {student.email}</option>
                  ))}
                </select>
                <input type="text" name="newPassword" placeholder="New password" value={passwordForm.newPassword} onChange={handlePasswordFormChange} />
                <button type="submit" className="primary-btn">Reset password</button>
              </form>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default AdminPage;
