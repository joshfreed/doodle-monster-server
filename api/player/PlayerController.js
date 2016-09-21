'use strict';

const Boom = require('boom');
const utils = require('../utils');

class PlayerController {
  constructor(playerService) {
    this.playerService = playerService;
  }

  createPlayer(request, reply) {
    return this.playerService
      .createPlayer(request.payload)
      .then(result => reply(result).created())
      .catch(err => utils.errorHandler(err, reply))
  }

  getPlayer(request, reply) {
    return this.playerService
      .findById(request.params.playerId)
      .then(result => {
        if (!result) {
          return reply(Boom.notFound());
        }

        reply(result.toObject());
      })
      .catch(err => utils.errorHandler(err, reply))
  }

  searchPlayers(request, reply) {
    return this.playerService
      .search(request.query)
      .then(result => {
        return reply(result.map(p => p.toObject()))
      })
      .catch(err => utils.errorHandler(err, reply))
  }
}

module.exports = PlayerController;
