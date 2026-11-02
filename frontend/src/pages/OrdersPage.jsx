import { useState } from 'react';
import { ArrowRightIcon } from '../components/Icons';

const initialOrders = [
  {
    id: '#CC-8492',
    time: '21:32',
    customer: 'Sipho Mabena',
    status: 'Ready for Pickup',
    items: [
      { label: '1x Township Kota Special', price: 40 },
      { label: '1x Cold Drinks 330ml (Coke/Sprite)', price: 18 },
    ],
    total: 58,
  },
];

function OrdersPage({ navigate }) {
  const [orders, setOrders] = useState(initialOrders);

  const handleRefreshOrders = () => {
    setOrders((current) =>
      current.map((order, index) => ({
        ...order,
        time: index === 0 ? '21:45' : order.time,
        status: index === 0 ? 'Ready for Pickup' : order.status,
      }))
    );
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1 className="section-title">My Orders</h1>
          <p className="section-subtitle">Track kitchen status and view your receipts.</p>
        </div>
        <button type="button" className="filter-btn" onClick={handleRefreshOrders}>
          <ArrowRightIcon className="refresh-icon" /> Refresh Orders
        </button>
      </div>

      <div className="orders-card-stack">
        {orders.map((order) => (
          <div className="order-card-compact" key={order.id}>
            <div className="order-top-row">
              <div className="order-meta">
                <span className="order-code">{order.id}</span>
                <span className="order-time">({order.time})</span>
                <span className="customer-name">{order.customer}</span>
              </div>

              <span className="status-pill ready">{order.status}</span>
            </div>

            <div className="order-items-compact">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.label}`} className="order-item-row">
                  <span>{item.label}</span>
                  <span>R {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-bottom-row">
              <div className="payment-title">💳 Payment: Pay at Counter</div>
              <div className="order-total">Total: R {order.total.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;
