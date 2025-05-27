const AppError = require('./appError');

class UnauthorizedError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}

module.exports = UnauthorizedError;
