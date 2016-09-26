'use strict';

const Player = require('mongoose').model('Player');
const Boom = require('boom');
const Promise = require('bluebird');

class AuthService {
  constructor(hashService, tokenService, playerService) {
    this.hashService = hashService;
    this.tokenService = tokenService;
    this.playerService = playerService;
  }

  registerPlayer(fields) {
    return this._registerPlayer(fields)
      .then(player => {
        return this._buildResult(player);
      });
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

  loginByFacebook(facebookId, email, displayName) {
    const fields = {
      facebookId: facebookId,
      email: email
    };

    if (displayName) {
      fields.displayName = displayName;
    }

    return this._findPlayer(facebookId, email)
      .then(player => {
        if (player) {
          return this._updatePlayer(player, fields);
        } else {
          return this._registerPlayer(fields);
        }
      })
      .then(player => {
        return this._buildResult(player);
      });
  }

  _registerPlayer(fields) {
    const clearPassword = fields.password;

    return this.playerService
      .createPlayer(fields)
      .then(player => {
        if (clearPassword) {
          return this._hashPassword(player, clearPassword);
        } else {
          return player;
        }
      })
  }

  _hashPassword(player, password) {
    return this.hashService
      .hash(password)
      .then(hashed => {
        player.password = hashed;
        return player.save();
      });
  }

  _findPlayer(facebookId, email) {
    return Player
      .findOne({facebookId: facebookId})
      .then(player => {
        if (player) {
          return player;
        } else {
          return Player.findOne({email: email});
        }
      });
  }

  _updatePlayer(player, fields) {
    return this.playerService.updatePlayer(player.id, fields);
  }

  _buildResult(player) {
    return {
      token: this.tokenService.makeToken(player),
      player: player.toObject()
    }
  }
}

module.exports = AuthService;
