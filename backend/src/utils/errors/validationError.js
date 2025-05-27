const AppError = require('./appError');

class ValidationError extends AppError {
  constructor(message = 'Invalid input') {
    super(message, 400);
  }
}

module.exports = ValidationError;
