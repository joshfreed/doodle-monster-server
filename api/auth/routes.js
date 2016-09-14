'use strict';

const Joi = require('joi');

const config = require('../config');

const AuthController = require('./AuthController');
const AuthService = require('./AuthService');
const HashService = require('./HashService');
const TokenService = require('./TokenService');

const hashService = new HashService();
const tokenService = new TokenService(config.secret);
const authService = new AuthService(hashService, tokenService);
const authController = new AuthController(authService);

const playerSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  displayName: Joi.string().allow('')
});

const routes = [
  {
    method: 'POST',
    path:'/auth/email',
    config: {
      auth: false,
      tags: ['api'],
      validate: {
        payload: {
          email: Joi.string().email(),
          password: Joi.string()
        }
      },
      response: {schema: Joi.object({
        result: Joi.string().valid('OK', 'LoginFailed', 'NoSuchPlayer').required(),
        token: Joi.string(),
        player: playerSchema
      })}
    },
    handler: authController.loginByEmail.bind(authController)
  }
];

module.exports = routes;
