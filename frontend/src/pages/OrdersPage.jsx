import { ArrowRightIcon } from '../components/Icons';

function OrdersPage({ navigate, orders = [], studentUser }) {
  const displayOrders = orders.filter((order) => {
    if (!studentUser) return true;
    return order.customer === studentUser.name || !order.customer;
  });

  const getStatusClass = (status) => {
    const normalized = String(status || 'Pending').toLowerCase();
    if (normalized.includes('ready')) return 'status-pill ready';
    if (normalized.includes('prep')) return 'status-pill prep';
    return 'status-pill pending';
  };

  return (
    <div className="student-dashboard-shell">
      <div className="orders-page">
        <div className="orders-header">
        <div>
          <h1 className="section-title">My Orders</h1>
          <p className="section-subtitle">Track kitchen status and view your receipts.</p>
        </div>
        <button type="button" className="filter-btn" onClick={() => navigate('/menu')}>
          <ArrowRightIcon className="refresh-icon" /> Browse Menu
        </button>
      </div>

      <div className="orders-card-stack">
        {displayOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders yet. Start by adding a few items to your cart.</p>
            <button type="button" className="primary-btn" onClick={() => navigate('/menu')}>Browse menu</button>
          </div>
        ) : (
          displayOrders.map((order) => (
            <div className="order-card-compact" key={order.id}>
              <div className="order-top-row">
                <div className="order-meta">
                  <span className="order-code">{order.orderNumber || order.id}</span>
                  <span className="order-time">({order.time})</span>
                  <span className="customer-name">{order.customer}</span>
                </div>

                <span className={getStatusClass(order.status)}>{order.status}</span>
              </div>

              <div className="order-items-compact">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${item.label || index}`} className="order-item-row">
                    <span>{item.label}</span>
                    <span>R {Number(item.price || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-bottom-row">
                <div className="payment-title">💳 Payment: {order.payment || 'Cash'}</div>
                <div className="order-total">Total: R {Number(order.total || 0).toFixed(2)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </div>
  );
}

export default OrdersPage;
