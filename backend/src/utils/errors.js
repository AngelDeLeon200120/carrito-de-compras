class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida', details) {
    super(400, message, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(401, message);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(403, message);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(404, message);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(409, message);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
};
