'use strict';

const mongoose = require('mongoose');

const Player = mongoose.model('Player');
const Monster = mongoose.model('Monster');
const HashService = require('../api/auth/HashService');
const MonsterService = require('../api/monster/MonsterService');

class Helper {
  constructor() {
    this.hashService = new HashService();
    this.monsterService = new MonsterService();
  }

  createPlayer(fields) {
    if (!fields.password) {
      fields.password = 'testing123';
    }

    return this.hashService
      .hash(fields.password)
      .then(hashed => {
        fields.password = hashed;
      })
      .then(() => {
        const player = new Player(fields);
        return player.save();
      })
      .then(p => p.toObject());
  }

  aMonster() {
    return MonsterBuilder.aMonster();
  }
}

class MonsterBuilder {
  static aMonster() {
    return new MonsterBuilder();
  }

  constructor() {
    this.gameOver = false;
  }

  withStartingPlayerId(playerId) {
    this.startingPlayerId = playerId;
    return this;
  }

  withOtherPlayerIds(otherPlayerIds) {
    this.otherPlayerIds = otherPlayerIds;
    return this;
  }

  thatIsFinished() {
    this.gameOver = true;
    return this;
  }

  withImageData(imageData) {
    this.imageData = imageData;
    return this;
  }

  withThumbnail(buffer) {
    this.thumbnail = buffer;
    return this;
  }

  build() {
    const monster = new Monster();
    monster.name = "";
    monster.currentPlayerNumber = 0;
    monster.turnCount = 0;
    monster.gameOver = this.gameOver;

    if (this.imageData) {
      monster.imageData = this.imageData;
    }
    if (this.thumbnail) {
      monster.thumbnail = this.thumbnail;
    }

    var playerIds = this.otherPlayerIds;
    playerIds.unshift(this.startingPlayerId);
    monster.players = playerIds;

    return monster
      .save()
      .then(monster => {
        return monster
          .populate('players')
          .execPopulate()
      })
      .then(m => m.toObject())
  }
}

module.exports = new Helper();