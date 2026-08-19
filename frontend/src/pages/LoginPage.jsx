import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { login, clearAuthError } from '../features/auth/authSlice';
import ErrorBanner from '../components/ErrorBanner';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      navigate(location.state?.from?.pathname || '/');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Iniciar sesión</h2>
        <ErrorBanner message={error} />
        <label>
          Correo
          <input type="email" name="email" required value={form.email} onChange={handleChange} />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </label>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p>
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
