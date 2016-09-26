'use strict';

var bcrypt = require('bcrypt');

const saltRounds = 10;

class HashService {
  hash(password) {
    if (!password) {
      return new Promise((resolve, reject) => {resolve();});
    }

    return new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          return reject(err);
        }

        resolve(hash);
      });
    });
  }

  compare(plainPassword, hashedPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hashedPassword, function(err, res) {
        if (err) {
          return reject(err);
        }

        resolve(res);
      });
    });
  }
}

module.exports = HashService;
