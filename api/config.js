'use strict';

const NODE_ENV = process.env.NODE_ENV || 'dev';

require('dotenv').config({silent: true, path: '.env.' + NODE_ENV});

const config = {
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGODB_URI,
  secret: process.env.JWT_SECRET || 'you have no secrets'
};

module.exports = config;
