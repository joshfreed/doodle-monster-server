'use strict';

const utils = require('../utils');

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  loginByEmail(request, reply) {
    const email = request.payload.email;
    const password = request.payload.password;

    return this.authService
      .loginByEmail(email, password)
      .then(result => reply(result))
      .catch(err => utils.errorHandler(err, reply))
  }
}

module.exports = AuthController;
