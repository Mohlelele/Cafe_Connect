function CartPage({ cart, navigate, updateCartItem }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                    <div className="cart-item-price">R {item.price.toFixed(2)}</div>
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
                <span>Total payable at counter</span>
                <strong>R {total.toFixed(2)}</strong>
              </div>

              <button type="button" className="primary-btn full-width" onClick={() => navigate('/orders')}>
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
