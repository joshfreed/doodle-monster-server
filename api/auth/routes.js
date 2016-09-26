'use strict';

const Joi = require('joi');
const AuthController = require('./AuthController');
const AuthService = require('./AuthService');
const HashService = require('./HashService');
const TokenService = require('./TokenService');
const PlayerService = require('../player/PlayerService');
const FacebookService = require('../utilities/FacebookService');

module.exports = (facebook) => {
  const config = require('../config');
  const hashService = new HashService();
  const tokenService = new TokenService(config.secret);
  const playerService = new PlayerService();

  const facebookService = facebook ? facebook : new FacebookService();
  const authService = new AuthService(hashService, tokenService, playerService, facebookService);
  const authController = new AuthController(authService);

  const playerSchema = Joi.object({
    id: Joi.string().required(),
    email: Joi.string().email(),
    displayName: Joi.string().allow(''),
    facebookId: Joi.string(),
  });

  const routes = [
    {
      method: 'POST',
      path: '/player',
      config: {
        auth: false,
        tags: ['api'],
        validate: {
          payload: {
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            displayName: Joi.string().allow('')
          }
        },
        response: {schema: Joi.object({
          token: Joi.string().required(),
          player: playerSchema.required()
        })}
      },
      handler: authController.registerPlayer.bind(authController)
    },

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
    },

    {
      method: 'POST',
      path:'/auth/fb',
      config: {
        auth: false,
        tags: ['api'],
        validate: {
          payload: {
            accessToken: Joi.string().required()
          }
        },
        response: {schema: Joi.object({
          token: Joi.string(),
          player: playerSchema
        })}
      },
      handler: authController.loginByFacebook.bind(authController)
    }
  ];

  return routes;
};
