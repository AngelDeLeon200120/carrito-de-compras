# Sports Cart — Backend

API REST para el carrito de compras de artículos deportivos, construida con **Node.js** y el
**Serverless Framework**, simulando funciones **Lambda** con `serverless-offline` y
**DynamoDB Local** como base de datos.

## Stack

- Node.js 18 + Serverless Framework v3 (funciones estilo Lambda, sin servidor Express)
- `serverless-offline` — simula API Gateway + Lambda en local
- `serverless-dynamodb` — descarga y levanta DynamoDB Local (usa Java, no requiere Docker)
- JWT (`jsonwebtoken`) + `bcryptjs` para autenticación
- `winston` para logging estructurado
- `nodemailer` para el correo de confirmación de compra (usa una cuenta de pruebas
  **Ethereal** automáticamente si no configuras SMTP real — no necesitas credenciales)
- `joi` para validación de entradas
- Imágenes de producto como **URLs públicas** (alternativa a MinIO/S3 indicada en el enunciado)

## Requisitos previos

- Node.js 18+
- Java 8+ (lo requiere DynamoDB Local internamente; no hace falta instalarlo aparte de tener
  el JRE disponible en el `PATH`, verifícalo con `java -version`)

## Instalación

```bash
cd backend
npm install
cp .env.example .env      # ya viene un .env con valores válidos para desarrollo local
npm run dynamodb:install  # descarga el jar de DynamoDB Local (solo la primera vez)
```

## Ejecución

```bash
npm run dev
```

Esto levanta en un solo proceso:

- DynamoDB Local en `http://localhost:8000`
- Creación automática de las tablas (`Products`, `Carts`, `Orders`, `Users`)
- Seed automático de productos de ejemplo (`scripts/products-seed.json`)
- La API en `http://localhost:3000`

Si necesitas volver a sembrar los productos manualmente (por ejemplo tras borrar la tabla):

```bash
npm run seed
```

## Endpoints

Todas las rutas responden JSON. Las marcadas con 🔒 requieren header
`Authorization: Bearer <token>`.

| Método | Ruta                        | Descripción                                  |
|--------|-----------------------------|-----------------------------------------------|
| POST   | `/auth/register`            | Crea una cuenta y devuelve token JWT          |
| POST   | `/auth/login`                | Autentica y devuelve token JWT                |
| GET    | `/products?category=&limit=&cursor=` | Lista productos, paginado y filtrado |
| GET    | `/products/{id}`            | Detalle de un producto                        |
| GET    | `/cart`                     | 🔒 Carrito del usuario autenticado             |
| POST   | `/cart/items`                | 🔒 Agrega un producto al carrito (`productId`, `quantity`) |
| DELETE | `/cart/items/{productId}`   | 🔒 Elimina un producto del carrito             |
| POST   | `/checkout`                  | 🔒 Finaliza la compra (valida stock, registra historial, envía correo) |
| GET    | `/orders`                   | 🔒 Historial de compras del usuario            |

### Ejemplo rápido con curl

```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@test.com","password":"password123"}'

# Listar productos de Running
curl "http://localhost:3000/products?category=Running&limit=8"

# Agregar al carrito (usa el token devuelto por login/register)
curl -X POST http://localhost:3000/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"productId":"prod-005","quantity":1}'

# Checkout
curl -X POST http://localhost:3000/checkout \
  -H "Authorization: Bearer TU_TOKEN"
```

## Correo de confirmación

Al no configurar `SMTP_HOST` en `.env`, el servicio crea automáticamente una cuenta de
pruebas en [Ethereal Email](https://ethereal.email/). En la consola verás un log como:

```
Correo de confirmación enviado (preview Ethereal) { previewUrl: 'https://ethereal.email/message/...' }
```

Abre esa URL para ver el correo simulado (no llega a una bandeja real). Si quieres enviar
correos reales, completa `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` en `.env`.

## Decisiones de diseño relevantes

- **Sin MinIO/Docker**: el enunciado permite simular S3 con MinIO *o* con URLs públicas. Se
  optó por URLs públicas (`placehold.co`) para no depender de Docker, que no está disponible
  en este entorno. La estructura de datos (campo `image` como URL) es la misma que tendría
  cualquier objeto servido desde un bucket S3/MinIO.
- **DynamoDB Local sin Docker**: se usa `serverless-dynamodb`, que descarga y ejecuta el jar
  oficial de DynamoDB Local sobre Java, evitando la dependencia de Docker.
- **Checkout atómico**: el descuento de stock de todos los ítems del carrito se hace en una
  única `TransactWriteCommand`; si algún producto no tiene stock suficiente, no se modifica
  ninguno (evita ventas parciales inconsistentes).
- **Serverless Framework v3** (no v4): v4 exige iniciar sesión con una cuenta de Serverless
  incluso para uso 100% local, lo cual añade fricción innecesaria para este ejercicio.
