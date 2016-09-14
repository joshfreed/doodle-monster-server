'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;
const config = require('../../api/config');
const TokenService = require('../../api/auth/TokenService');
const HashService = require('../../api/auth/HashService');
const should = require('chai').should();
const Boom = require('boom');

lab.experiment('POST /player', () => {
  const url = "/api/player";
  const hashService = new HashService();
  var hashedPassword;

  lab.beforeEach(done => {
    helper
      .createPlayer({email: "player9@email.com", password: "testing123", displayName: "Barry Barryson"})
      .then(() => done()).catch(done);
  });

  lab.test('Creates a new player', done => {
    const params = {
      email: "player1@email.com",
      password: "testing123",
      displayName: "Fred Jones"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(201);

      const payload = JSON.parse(res.payload);

      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.is.not.empty;
      payload.player.should.have.property('email').that.equals(params.email);
      payload.player.should.have.property('displayName').that.equals('Fred Jones');
      payload.player.should.not.have.property('password');

      // Verify a token was created
      const tokenService = new TokenService(config.secret);
      const expected = tokenService.makeToken(payload.player);
      payload.should.have.property('token').that.is.not.empty;
      payload.token.should.equal(expected);

      // Verify the player was saved to mongoose with the hashed password
      require('mongoose').model('Player')
        .findById(payload.player.id)
        .then(expected => {
          should.exist(expected);
          return hashService.compare('testing123', expected.password);
        })
        .then(passwordMatch => {
          passwordMatch.should.be.true;
          done();
        })
        .catch(done);
    });
  });

  lab.test('Does not create a new player if the email address is already in use', done => {
    const params = {
      email: "player9@email.com",
      password: "testing123",
      displayName: "Fred Jones"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(400);
      const payload = JSON.parse(res.payload);
      payload.should.deep.equal(Boom.badRequest("That email address is already in use").output.payload);
      done();
    });
  });

  lab.test('An email address is required', done => {
    const params = {
      password: "testing123",
      displayName: "Fred Jones"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(400);
      const payload = JSON.parse(res.payload);
      payload.message.should.include('"email" is required');
      done();
    });
  });

  lab.test('A password is required', done => {
    const params = {
      email: "player1@email.com",
      displayName: "Fred Jones"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(400);
      const payload = JSON.parse(res.payload);
      payload.message.should.include('"password" is required');
      done();
    });
  });
});

lab.experiment('GET /player/:playerId', () => {
  // lab.beforeEach() {
  //
  // }
});