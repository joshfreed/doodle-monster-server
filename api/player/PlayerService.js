'use strict';

const Player = require('mongoose').model('Player');
const Boom = require('boom');

class PlayerService {
  createPlayer(fields) {
    delete fields.password;

    return Player
      .findOne({email: fields.email})
      .then(otherPlayer => {
        if (otherPlayer) {
          throw Boom.badRequest('That email address is already in use')
        }

        const player = new Player(fields);
        return player.save();
      });
  }

  updatePlayer(playerId, fields) {
    delete fields.password;
    return Player.findByIdAndUpdate(playerId, fields, {new: true})
  }

  findById(playerId) {
    return Player.findById(playerId)
  }

  search(terms) {
    if (terms.email) {
      terms.email = new RegExp(terms.email, "i");
    }

    return Player.find(terms);
  }
}

module.exports = PlayerService;
