const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const express = require('express');
require('express-async-errors');
const app = express();

const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Connect to the DB
logger.info('Connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI_W_PWORD, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message);
  });

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - :body'));

app.use(express.static('build'));
app.use(express.json());
app.use(cors());

app.use(middleware.tokenExtractor); // Order of MW and routers matter!
app.use(middleware.userExtractor);
app.use(middleware.requestLogger);

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;