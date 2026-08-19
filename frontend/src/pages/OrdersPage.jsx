import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../features/orders/ordersSlice';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="orders-page">
      <h1>Mis pedidos</h1>
      <ErrorBanner message={error} />
      {status === 'loading' ? (
        <Loader label="Cargando historial..." />
      ) : items.length === 0 ? (
        <p className="empty-state">Aún no tienes compras registradas.</p>
      ) : (
        <div className="orders-list">
          {items.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <span>Pedido {order.orderId}</span>
                <span>{new Date(order.createdAt).toLocaleString('es-CO')}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <ul>
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.quantity} × {item.name} — {currencyFormatter.format(item.price)}
                  </li>
                ))}
              </ul>
              <div className="order-total">Total: {currencyFormatter.format(order.total)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
