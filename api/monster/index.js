'use strict';

module.exports = (server) => {
  require('./schema.js');
  server.route(require('./routes'));
};
