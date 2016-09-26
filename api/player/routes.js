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
  },

  {
    method: 'GET',
    path: '/players',
    config: {
      tags: ['api'],
      validate: {
        query: {
          email: Joi.string()
        }
      },
      response: {schema: Joi.array().items(playerSchema).required()}
    },
    handler: playerController.searchPlayers.bind(playerController)
  }
];

module.exports = routes;
