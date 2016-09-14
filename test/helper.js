'use strict';

const mongoose = require('mongoose');

const Player = mongoose.model('Player');
const HashService = require('../api/auth/HashService');

class Helper {
  createPlayer(fields) {
    const hashService = new HashService();

    return hashService
      .hash(fields.password)
      .then(hashed => {
        fields.password = hashed;
      })
      .then(() => {
        const player = new Player(fields);
        return player.save();
      });
  }
}

module.exports = new Helper();