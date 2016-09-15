'use strict';

const Joi = require('joi');
const config = require('../config');
const PlayerController = require('./PlayerController');
const PlayerService = require('./PlayerService');
const HashService = require('../auth/HashService');
const TokenService = require('../auth/TokenService');

const hashService = new HashService();
const tokenService = new TokenService(config.secret);
const playerService = new PlayerService(hashService, tokenService);
const playerController = new PlayerController(playerService);

const playerSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  displayName: Joi.string().allow('')
});

const routes = [
  {
    method: 'POST',
    path:'/player',
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
    handler: playerController.createPlayer.bind(playerController)
  },

  {
    method: 'GET',
    path: '/player/{playerId}',
    config: {
      tags: ['api'],
      validate: {
        params: {
          playerId: Joi.string().required()
        }
      },
      response: {schema: playerSchema.required()}
    },
    handler: playerController.getPlayer.bind(playerController)
  }
];

module.exports = routes;
