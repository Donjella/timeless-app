const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message;
  }

  switch (err.name) {
    case 'ValidationError':
      statusCode = 400;
      message = err.message || 'Validation Error';
      break;
    case 'CastError':
      statusCode = 400;
      message = `Invalid ${err.path}`;
      break;
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      statusCode = 401;
      message = 'Invalid or expired token, please log in again';
      break;
    default:
      break;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = { errorHandler };
