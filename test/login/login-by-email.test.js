'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;

lab.experiment('POST /auth/email', () => {
  const url = "/api/auth/email";

  lab.beforeEach(done => {
    helper
      .createPlayer({email: "player1@email.com", password: "testing123", displayName: "Fred Jones"})
      .then(() => done()).catch(done);
  });

  lab.test('Logs in', done => {
    const params = {
      email: "player1@email.com",
      password: "testing123"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('result').that.equals('OK');
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('email').that.equals(params.email);
      payload.player.should.have.property('displayName').that.equals('Fred Jones');
      payload.player.should.not.have.property('password');

      done();
    });
  });

  lab.test('User not found', done => {
    const params = {
      email: "NOPLAYER@email.com",
      password: "testing123"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('result').that.equals('NoSuchPlayer');

      done();
    });
  });

  lab.test('Invalid password', done => {
    const params = {
      email: "player1@email.com",
      password: "WRONG_PASSWORD"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('result').that.equals('LoginFailed');

      done();
    });
  });

});
