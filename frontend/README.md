# Sports Cart — Frontend

SPA construida con **React + Vite** y **Redux Toolkit** para gestión de estado, que consume
la API REST del backend (carrito de compras de artículos deportivos).

## Stack

- React 18 + Vite
- React Router (rutas protegidas para carrito / historial de pedidos)
- Redux Toolkit (`createSlice` / `createAsyncThunk` por feature: `auth`, `products`, `cart`, `orders`)
- Axios con interceptores (adjunta el JWT automáticamente y normaliza errores)

## Requisitos previos

El backend debe estar corriendo en `http://localhost:3000` (ver [`../backend/README.md`](../backend/README.md)).

## Instalación y ejecución

```bash
cd frontend
npm install
cp .env.example .env   # ya viene un .env apuntando a http://localhost:3000
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Estructura

```
src/
  api/client.js         # instancia de axios (interceptor JWT + normalización de errores)
  app/store.js           # configuración del store de Redux
  features/
    auth/authSlice.js    # login, registro, sesión persistida en localStorage
    products/productsSlice.js
    cart/cartSlice.js     # carrito + checkout
    orders/ordersSlice.js
  components/            # Navbar, ProductCard, ProtectedRoute, Loader, ErrorBanner
  pages/                  # ProductsPage, LoginPage, RegisterPage, CartPage, OrdersPage
```

## Funcionalidad cubierta

- Ver productos disponibles con paginación (cursor) y filtro por categoría.
- Login / registro con persistencia de sesión (JWT en `localStorage`, se reinyecta al recargar).
- Agregar y quitar productos del carrito (requiere sesión iniciada).
- Checkout con validación de stock en el backend y confirmación visual del pedido.
- Historial de compras.
- Manejo de estados de carga (`Loader`) y error (`ErrorBanner`) en cada pantalla.
- Rutas protegidas (`/cart`, `/orders`) que redirigen a `/login` si no hay sesión.
