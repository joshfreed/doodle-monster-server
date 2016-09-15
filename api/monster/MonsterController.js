'use strict';

const Boom = require('boom');
const utils = require('../utils');

class MonsterController {
  constructor(monsterService) {
    this.monsterService = monsterService;
  }

  createMonster(request, reply) {
    const me = request.auth.credentials;
    const otherPlayerIds = request.payload.playerIds;

    this.monsterService
      .createMonster(me.id, otherPlayerIds)
      .then(monster => reply(monster.toObject()).created())
      .catch(err => utils.errorHandler(err, reply))
  }
}

module.exports = MonsterController;
