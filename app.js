const express = require('express');
const app = express();
app.use(express.static('build'));
app.use(express.json());

const blogsRouter = require('./controllers/blogs');
app.use('/api/blogs', blogsRouter);

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
app.use(middleware.requestLogger);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

const mongoose = require('mongoose');
const cors = require('cors');
app.use(cors());

// Connect to the DB
logger.info('Connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI_W_PWORD, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message);
  });

module.exports = app;