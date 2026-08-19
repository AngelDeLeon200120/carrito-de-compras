const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

function success(statusCode, data) {
  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  };
}

function error(statusCode, message, details) {
  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ message, ...(details ? { details } : {}) }),
  };
}

module.exports = { success, error, DEFAULT_HEADERS };
