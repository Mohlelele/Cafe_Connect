function CartPage({ cart, navigate, updateCartItem, onCheckout, studentUser }) {
  const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

  return (
    <div className="cart-page">
      <div className="content-card cart-card">
        <div className="cart-header-row">
          <h1>Your Basket</h1>
          <button type="button" className="ghost-link" onClick={() => navigate('/menu')}>Continue shopping</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <button type="button" className="primary-btn" onClick={() => navigate('/menu')}>Browse menu</button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-copy">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">R {Number(item.price || 0).toFixed(2)}</div>
                  </div>

                  <div className="cart-controls">
                    <button type="button" className="qty-btn" onClick={() => updateCartItem(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" className="qty-btn" onClick={() => updateCartItem(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-box">
              <div className="total-row">
                <span>Items subtotal</span>
                <strong>R {total.toFixed(2)}</strong>
              </div>

              <div className="total-row total-row-main">
                <span>Total payable</span>
                <strong>R {total.toFixed(2)}</strong>
              </div>

              <div className="cart-payment-row">
                <label htmlFor="paymentMethod">Payment method</label>
                <select id="paymentMethod" defaultValue="Cash" className="status-select">
                  <option value="Cash">Pay at cafeteria</option>
                  <option value="Card">Debit/Credit card</option>
                  <option value="EFT">EFT</option>
                  <option value="Instant EFT">Instant EFT</option>
                </select>
              </div>

              <button
                type="button"
                className="primary-btn full-width"
                onClick={() => {
                  const methodSelect = document.getElementById('paymentMethod');
                  const method = methodSelect ? methodSelect.value : 'Cash';
                  if (onCheckout) {
                    onCheckout(method);
                    return;
                  }
                  if (!studentUser) {
                    navigate('/login');
                    return;
                  }
                  navigate('/orders');
                }}
              >
                Place order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartPage;
