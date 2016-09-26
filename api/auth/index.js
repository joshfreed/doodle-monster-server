'use strict';

module.exports = (server, facebookService) => {
  server.route(require('./routes')(facebookService));
};
