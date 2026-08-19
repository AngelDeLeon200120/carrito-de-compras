# Carrito de compras de artículos deportivos

Prueba técnica: e-commerce full-stack con backend serverless (Node.js) y frontend SPA (React).

- [`backend/`](backend/README.md) — API REST simulando funciones Lambda con `serverless-offline`
  y `DynamoDB Local`, autenticación JWT, checkout con validación de stock y correo de confirmación.
- [`frontend/`](frontend/README.md) — SPA en React + Redux Toolkit que consume la API.

## Ejecución rápida

Se necesitan dos terminales (backend y frontend), en ese orden:

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env
npm run dynamodb:install
npm run dev          # API en http://localhost:3000, tablas y seed automáticos

# Terminal 2 — frontend
cd frontend
npm install
cp .env.example .env
npm run dev           # SPA en http://localhost:5173
```

Requisitos: Node.js 18+ y Java 8+ (lo usa DynamoDB Local internamente; sin Docker).

## Qué cubre cada criterio de evaluación

| Criterio | Dónde |
|---|---|
| Estructura y separación de responsabilidades | `backend/src/{handlers,repositories,services,middleware,validation}`, `frontend/src/{features,pages,components,api}` |
| Promesas/async-await y manejo de errores | Todos los handlers son `async`; wrapper central (`backend/src/middleware/wrapper.js`) traduce errores a respuestas HTTP; `apiClient` normaliza errores en el frontend |
| Simulación realista de AWS | Lambda vía `serverless-offline`, DynamoDB vía `DynamoDB Local`, imágenes como URLs públicas (alternativa a S3/MinIO permitida por el enunciado) |
| Calidad de código y buenas prácticas | Capas separadas, validación con `joi`, checkout atómico con `TransactWriteCommand`, logging estructurado con `winston` |
| Documentación | Este README + `backend/README.md` + `frontend/README.md`, cada uno con instrucciones de instalación/ejecución y decisiones de diseño |
| Seguridad básica | JWT + `bcryptjs`, middleware de autorización en rutas sensibles, validación de inputs con `joi`, cabeceras de seguridad básicas en las respuestas |

## Decisiones de diseño (por falta de Docker en el entorno)

- **DynamoDB Local sin Docker**: se usa el plugin `serverless-dynamodb`, que descarga y ejecuta
  el jar oficial de DynamoDB Local sobre Java.
- **Sin MinIO**: el enunciado permite simular S3 "usando MinIO o URLs públicas"; se optó por URLs
  públicas para no depender de Docker.
- **Serverless Framework v3** (no v4, que exige cuenta/login incluso para uso 100% local).

Más detalle de cada decisión en los README de `backend/` y `frontend/`.

## Verificación end-to-end realizada

Se probó manualmente el flujo completo (registro → login → listar/filtrar productos → agregar
al carrito → checkout → historial de pedidos) tanto por API (`curl`) como en el navegador contra
la SPA real, incluyendo el correo de confirmación (previsualizable vía Ethereal Email en los logs
del backend).
