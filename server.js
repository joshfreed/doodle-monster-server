'use strict';

const config = require('./api/config');
require('mongoose').Promise = require('bluebird');

const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({
  port: config.port,
  routes: {validate: {options: {stripUnknown: true}}}
});


//// Plugins

const swaggerOpts = {
  info: {
    'title': 'Test API Documentation',
    'version': '1'
  },
  basePath: '/api/'
};
server.register(
  [require('inert'), require('vision'), {'register': require('hapi-swagger'), 'options': swaggerOpts}],
  () => {}
);

function validate(decoded, request, cb) {
  print(decoded);
  cb(null, true);
}

server.register(require('hapi-auth-jwt2'), err => {
  if (err) {
    throw err;
  }

  server.auth.strategy('jwt', 'jwt', {
    key: config.secret,
    validateFunc: validate,
    verifyOptions: {algorithms: ['HS256']}
  });

  server.auth.default('jwt')
});

//// Modules

require('./api/player')(server);
require('./api/auth')(server);


//// GO!

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log('Server running at:', server.info.uri);
});

module.exports = server;
