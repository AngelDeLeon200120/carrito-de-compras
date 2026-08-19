import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setCategory } from '../features/products/productsSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import ErrorBanner from '../components/ErrorBanner';

const CATEGORIES = ['Fútbol', 'Baloncesto', 'Running', 'Fitness', 'Ciclismo', 'Natación'];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { items, category, nextCursor, cursorHistory, status, error } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts({ category }));
  }, [dispatch, category]);

  const handleCategoryChange = (e) => {
    dispatch(setCategory(e.target.value));
  };

  const handleNextPage = () => {
    if (nextCursor) {
      dispatch(fetchProducts({ category, cursor: nextCursor }));
    }
  };

  const handlePrevPage = () => {
    const history = [...cursorHistory];
    history.pop();
    const previousCursor = history[history.length - 1] || undefined;
    dispatch(fetchProducts({ category, cursor: previousCursor }));
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Artículos deportivos</h1>
        <select value={category} onChange={handleCategoryChange}>
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <ErrorBanner message={error} />

      {status === 'loading' ? (
        <Loader label="Cargando productos..." />
      ) : (
        <>
          <div className="products-grid">
            {items.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
          {items.length === 0 && <p className="empty-state">No hay productos en esta categoría.</p>}
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={cursorHistory.length === 0}>
              ← Anterior
            </button>
            <button onClick={handleNextPage} disabled={!nextCursor}>
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
