'use strict';

const Joi = require('joi');
const MonsterController = require('./MonsterController');
const MonsterService = require('./MonsterService');

const monsterService = new MonsterService();
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
  thumbnail: Joi.any(),
  lastTurn: Joi.date(),
  players: Joi.array().items(playerSchema).required()
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
  }
];

module.exports = routes;
