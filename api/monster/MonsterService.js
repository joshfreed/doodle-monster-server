'use strict';

const Monster = require('mongoose').model('Monster');
const Boom = require('boom');
const _ = require('lodash');

class MonsterService {
  constructor(imageService) {
    this.imageService = imageService;
  }

  createMonster(startingPlayerId, otherPlayerIds) {
    var monster = new Monster();
    monster.createMonster(startingPlayerId, otherPlayerIds);
    return this._saveMonster(monster);
  }

  getActiveMonsters(playerId) {
    return Monster
      .find({gameOver: false})
      .populate('players')
      .where('players').in([playerId])
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

  getMonster(monsterId) {
    return Monster
      .findById(monsterId)
      .select('+imageData')
      .populate('players')
  }

  addTurn(monsterId, playerId, imageData, letter) {
    return Monster
      .findById(monsterId)
      .then(monster => {
        monster.addTurn(playerId, imageData, letter, new Date());
        return this._generateThumbnail(monster);
      });
  }

  _generateThumbnail(monster) {
    return this.imageService
      .makeThumbnail(monster.imageData)
      .then(buffer => {
        monster.thumbnail = buffer;
        return this._saveMonster(monster);
      });
  }
}

module.exports = MonsterService;
