const logger = require('./logger');

const jwt = require('jsonwebtoken');

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
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({error: 'invalid token'});
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({error: 'token expired'});
  }

  next(err);
};

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization');

  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req['token'] = auth.substring(7);
  }

  next();
};

const userExtractor = (req, res, next) => {
  if (req.token) {
    req.user = jwt.verify(req.token, process.env.SECRET).id;
  }
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
};