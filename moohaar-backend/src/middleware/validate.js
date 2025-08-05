import Joi from 'joi';

// Joi validation middleware factory
// Validates req.body against the provided schema and
// returns 400 with message on failure.
export default (schema) => (req, res, next) => {
  // Ensure a proper Joi schema is supplied
  if (!Joi.isSchema(schema)) {
    return next(new Error('Invalid validation schema'));
  }
  const { error } = schema.validate(req.body);
  if (error) {
    // Forward validation error to central error handler
    error.name = 'ValidationError';
    return next(error);
  }
  return next();
};
