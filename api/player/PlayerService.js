'use strict';

const Player = require('mongoose').model('Player');
const Boom = require('boom');

class PlayerService {
  constructor(hashService, tokenService) {
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  createPlayer(fields) {
    return this.hashService
      .hash(fields.password)
      .then(hashed => fields.password = hashed)
      .then(() => Player.findOne({email: fields.email}))
      .then(otherPlayer => {
        if (otherPlayer) {
          throw Boom.badRequest('That email address is already in use')
        }

        const player = new Player(fields);
        return player.save()
      })
      .then(player => {
        return {
          token: this.tokenService.makeToken(player),
          player: player.toObject()
        }
      });
  }

  findById(playerId) {
    return Player.findById(playerId)
  }
}

module.exports = PlayerService;
