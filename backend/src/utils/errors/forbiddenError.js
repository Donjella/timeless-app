const AppError = require('./appError');

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

module.exports = ForbiddenError;
