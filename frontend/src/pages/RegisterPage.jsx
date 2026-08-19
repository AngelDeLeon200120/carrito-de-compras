import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearAuthError } from '../features/auth/authSlice';
import ErrorBanner from '../components/ErrorBanner';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>
        <ErrorBanner message={error} />
        <label>
          Nombre
          <input type="text" name="name" required value={form.name} onChange={handleChange} />
        </label>
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
            minLength={8}
            value={form.password}
            onChange={handleChange}
          />
        </label>
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creando cuenta...' : 'Registrarme'}
        </button>
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
