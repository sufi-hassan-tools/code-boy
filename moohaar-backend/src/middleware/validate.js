import Joi from 'joi'; // eslint-disable-line import/no-unresolved

// Joi validation middleware factory
// Validates a request property against the provided schema and
// forwards errors to the central error handler.
//
// property - Which request property to validate (e.g. 'body', 'query')
//            defaults to 'body'.
export default (schema, property = 'body') => (req, res, next) => {
  // Ensure a proper Joi schema is supplied
  if (!Joi.isSchema(schema)) {
    return next(new Error('Invalid validation schema'));
  }

  const { error, value } = schema.validate(req[property]);
  if (error) {
    // Forward validation error to central error handler
    error.name = 'ValidationError';
    return next(error);
  }

  // Replace the original value with the sanitized version
  req[property] = value;
  return next();
};
