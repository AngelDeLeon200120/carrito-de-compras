import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart, removeFromCart, checkout, resetCheckoutStatus } from '../features/cart/cartSlice';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error, checkoutStatus, checkoutError, lastOrder } = useSelector(
    (state) => state.cart
  );

  useEffect(() => {
    dispatch(fetchCart());
    return () => dispatch(resetCheckoutStatus());
  }, [dispatch]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    dispatch(checkout());
  };

  if (checkoutStatus === 'succeeded' && lastOrder) {
    return (
      <div className="checkout-success">
        <h1>¡Compra confirmada! 🎉</h1>
        <p>
          Pedido <strong>{lastOrder.orderId}</strong> por{' '}
          <strong>{currencyFormatter.format(lastOrder.total)}</strong>
        </p>
        <p>Te enviamos un correo de confirmación con el detalle de tu compra.</p>
        <button onClick={() => navigate('/orders')}>Ver mis pedidos</button>
        <button onClick={() => navigate('/')}>Seguir comprando</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Tu carrito</h1>
      <ErrorBanner message={error || checkoutError} />

      {status === 'loading' && items.length === 0 ? (
        <Loader label="Cargando carrito..." />
      ) : items.length === 0 ? (
        <p className="empty-state">Tu carrito está vacío.</p>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p>
                    {item.quantity} × {currencyFormatter.format(item.price)}
                  </p>
                </div>
                <span className="cart-item-subtotal">
                  {currencyFormatter.format(item.price * item.quantity)}
                </span>
                <button onClick={() => dispatch(removeFromCart(item.productId))}>Eliminar</button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <span>Total: {currencyFormatter.format(total)}</span>
            <button onClick={handleCheckout} disabled={checkoutStatus === 'loading'}>
              {checkoutStatus === 'loading' ? 'Procesando...' : 'Finalizar compra'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
