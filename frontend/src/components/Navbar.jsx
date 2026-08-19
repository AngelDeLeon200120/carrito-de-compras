import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">
        🏅 Sports Cart
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end>
          Productos
        </NavLink>
        {user && (
          <>
            <NavLink to="/cart">Carrito ({cartCount})</NavLink>
            <NavLink to="/orders">Mis pedidos</NavLink>
          </>
        )}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <span className="user-name">Hola, {user.name}</span>
            <button onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Ingresar</NavLink>
            <NavLink to="/register">Crear cuenta</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
