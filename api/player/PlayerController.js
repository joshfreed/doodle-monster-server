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
}

module.exports = PlayerController;
