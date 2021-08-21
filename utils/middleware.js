const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info('Title:', req.title);
  logger.info('Author:  ', req.author);
  logger.info('Url:  ', req.url);
  logger.info('Likes:  ', req.likes);
  logger.info('---');
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'});
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({error: 'malformatted id'});
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({error: err.message});
  }

  next(err);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
};