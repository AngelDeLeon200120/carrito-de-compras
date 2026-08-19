const logger = require('../utils/logger');
const { error: errorResponse } = require('../utils/response');
const { requireAuth } = require('./auth');
const { AppError } = require('../utils/errors');

function parseBody(event) {
  if (!event.body) return {};
  try {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (err) {
    throw new AppError(400, 'El cuerpo de la petición no es un JSON válido');
  }
}

/**
 * Envuelve un handler Lambda con: logging, parseo de body, auth opcional
 * y traducción uniforme de errores a respuestas HTTP.
 */
function wrapHandler(fn, { auth = false } = {}) {
  return async (event, context) => {
    const requestId = context?.awsRequestId || 'local';
    logger.info('Incoming request', {
      requestId,
      method: event.httpMethod,
      path: event.path,
    });

    try {
      event.body = parseBody(event);
      event.query = event.queryStringParameters || {};
      event.pathParams = event.pathParameters || {};

      if (auth) {
        event.user = requireAuth(event);
      }

      const result = await fn(event, context);
      logger.info('Request completed', { requestId, statusCode: result.statusCode });
      return result;
    } catch (err) {
      if (err instanceof AppError) {
        logger.warn('Handled error', {
          requestId,
          statusCode: err.statusCode,
          message: err.message,
        });
        return errorResponse(err.statusCode, err.message, err.details);
      }

      logger.error('Unhandled error', { requestId, error: err.message, stack: err.stack });
      return errorResponse(500, 'Error interno del servidor');
    }
  };
}

module.exports = { wrapHandler };
