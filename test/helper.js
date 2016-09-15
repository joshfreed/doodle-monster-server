'use strict';

const mongoose = require('mongoose');

const Player = mongoose.model('Player');
const HashService = require('../api/auth/HashService');

class Helper {
  constructor() {
    this.hashService = new HashService();
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
}

module.exports = new Helper();