'use strict';

const FB = require('fb');
// const Promise = require('bluebird');

class FacebookService {
  me(accessToken) {
    FB.setAccessToken(accessToken);

    return new Promise((resolve, reject) => {
      FB.api('me?fields=name,email', res => {
        if (res.error) {
          return reject(res.error);
        }

        resolve({
          id: res.id,
          name: res.name,
          email: res.email
        });
      });
    });
  }
}

module.exports = FacebookService;
