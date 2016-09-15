'use strict';

const Player = require('mongoose').model('Player');

class AuthService {
  constructor(hashService, tokenService) {
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  loginByEmail(email, password) {
    return Player
      .findOne({email: email})
      .then(player => {
        if (!player) {
          return {result: 'NoSuchPlayer'};
        }

        return this.hashService
          .compare(password, player.password)
          .then(passwordMatch => {
            if (passwordMatch) {
              const token = this.tokenService.makeToken(player);
              return {result: 'OK', token: token, player: player.toObject()};
            } else {
              return {result: 'LoginFailed'};
            }
          })
      })
  }
}

module.exports = AuthService;
