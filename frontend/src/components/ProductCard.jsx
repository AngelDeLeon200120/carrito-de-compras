import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const cartStatus = useSelector((state) => state.cart.status);

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    dispatch(addToCart({ productId: product.productId, quantity: 1 }));
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <div className="product-card-body">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{currencyFormatter.format(product.price)}</span>
          <span className={`product-stock ${outOfStock ? 'out' : ''}`}>
            {outOfStock ? 'Sin stock' : `Stock: ${product.stock}`}
          </span>
        </div>
        <button
          disabled={!token || outOfStock || cartStatus === 'loading'}
          onClick={handleAdd}
          title={!token ? 'Inicia sesión para agregar al carrito' : undefined}
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
