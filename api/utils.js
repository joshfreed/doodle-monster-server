'use strict';

const Boom = require('boom');

const utils = {
  errorHandler: (err, reply) => {
    if (err.hasOwnProperty('isBoom') && err.isBoom) {
      return reply(err);
    }

    return reply(Boom.badImplementation(err));
  }
};

module.exports = utils;
