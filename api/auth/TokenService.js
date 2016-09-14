'use strict';

const jwt = require('jsonwebtoken');

class TokenService {
  constructor(secret) {
    this.secret = secret;
  }
  
  makeToken(player) {
    var claims = {
      id: player.id,
      email: player.email
    };
    return jwt.sign(claims, this.secret, {expiresIn: "1y"});
  }
}

module.exports = TokenService;
