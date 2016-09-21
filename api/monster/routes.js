'use strict';

const Joi = require('joi');
const MonsterController = require('./MonsterController');
const MonsterService = require('./MonsterService');
const ImageService = require('../utilities/ImageService');

const imageService = new ImageService();
const monsterService = new MonsterService(imageService);
const monsterController = new MonsterController(monsterService);

const playerSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  displayName: Joi.string().allow('')
});

const monsterSchema = Joi.object({
  id: Joi.string().required(),
  currentPlayerNumber: Joi.number().required(),
  turnCount: Joi.number(),
  gameOver: Joi.bool(),
  name: Joi.string().allow(''),
  thumbnail: Joi.binary().encoding('base64'),
  lastTurn: Joi.date(),
  players: Joi.array().items(playerSchema).required()
});

const monsterWithImageData = monsterSchema.keys({
  imageData: Joi.binary().encoding('base64')
});

const routes = [
  {
    method: 'POST',
    path: '/monster',
    config: {
      tags: ['api'],
      validate: {
        payload: {
          playerIds: Joi.array().min(1).items(Joi.string()).required()
        }
      },
      response: {schema: monsterSchema.required().label('Monster')}
    },
    handler: monsterController.createMonster.bind(monsterController)
  },

  {
    method: 'GET',
    path: '/me/monsters',
    config: {
      tags: ['api'],
      response: {schema: Joi.array().items(monsterSchema)}
    },
    handler: monsterController.getActiveMonsters.bind(monsterController)
  },

  {
    method: 'GET',
    path: '/monster/{monsterId}',
    config: {
      tags: ['api'],
      validate: {params: {monsterId: Joi.string().required()}},
      response: {schema: monsterWithImageData.label('Monster')}
    },
    handler: monsterController.getMonster.bind(monsterController)
  },

  {
    method: 'POST',
    path: '/monster/{monsterId}/turns',
    config: {
      tags: ['api'],
      // plugins: {'hapi-swagger': {payloadType: 'form'}},
      // payload: {
      //   output: 'stream',
      //   parse: true,
      //   // allow: 'multipart/form-data',
      //   maxBytes: 1048576 * 20, // 20MB
      // },
      validate: {
        params: {
          monsterId: Joi.string().required()
        },
        payload: {
          imageData: Joi.binary().encoding('base64'),
          letter: Joi.string().length(1).required()
        }
      },
    },
    handler: monsterController.addTurn.bind(monsterController)
  }
];

module.exports = routes;
