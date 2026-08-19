const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');

function extractToken(event) {
  const header = event.headers?.Authorization || event.headers?.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim();
}

function requireAuth(event) {
  const token = extractToken(event);
  if (!token) {
    throw new UnauthorizedError('Token de autenticación no proporcionado');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { userId: payload.sub, email: payload.email };
  } catch (err) {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}

module.exports = { requireAuth };
