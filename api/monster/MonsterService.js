'use strict';

const Monster = require('mongoose').model('Monster');
const Boom = require('boom');
const _ = require('lodash');

class MonsterService {
  createMonster(startingPlayerId, otherPlayerIds) {
    var monster = new Monster();
    monster.name = "";
    monster.currentPlayerNumber = 0;
    monster.turnCount = 0;
    monster.gameOver = false;

    let playerIds = otherPlayerIds;
    playerIds.unshift(startingPlayerId);
    monster.players = _.uniq(playerIds);

    return this._saveMonster(monster);
  }

  _saveMonster(monster) {
    return monster
      .save()
      .then(monster => {
        return monster
          .populate('players')
          .execPopulate()
      })
  }
}

module.exports = MonsterService;
