'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;

lab.experiment('POST /auth/fb', () => {
  const url = "/api/auth/fb";
  var player1, player3;

  lab.beforeEach(done => {
    helper
      .createPlayer({
        email: "player1@email.com",
        password: "testing123",
        displayName: "Fred Jones",
        facebookId: '111222333444555'
      })
      .then(player => player1 = player)
      .then(() => helper.createPlayer({email: "player3@email.com", displayName: "Barry Johnson"}))
      .then(player => player3 = player)
      .then(() => done()).catch(done);
  });

  lab.test('Creates a new player the first time they login by facebook', done => {
    const params = {
      facebookId: "999888777666555",
      email: "player2@email.com",
      displayName: "Jerry Smith"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.not.equals(player1.id);
      payload.player.should.have.property('id').that.not.equals(player3.id);
      payload.player.should.have.property('email').that.equals(params.email);
      payload.player.should.have.property('displayName').that.equals(params.displayName);
      payload.player.should.have.property('facebookId').that.equals(params.facebookId);
      payload.player.should.not.have.property('password');

      done();
    });
  });

  lab.test('Logs the player in if the facebook account was already linked', done => {
    const params = {
      facebookId: "111222333444555",
      email: "player1@email.com"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.equals(player1.id);
      payload.player.should.have.property('email').that.equals(params.email);
      payload.player.should.have.property('facebookId').that.equals(params.facebookId);
      payload.player.should.not.have.property('password');

      done();
    });
  });

  lab.test('Updates email and display name of the linked account', done => {
    const params = {
      facebookId: "111222333444555",
      email: "player999@email.com",
      displayName: "My new name"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.equals(player1.id);
      payload.player.should.have.property('email').that.equals(params.email);
      payload.player.should.have.property('displayName').that.equals(params.displayName);
      payload.player.should.have.property('facebookId').that.equals(params.facebookId);
      payload.player.should.not.have.property('password');

      done();
    });
  });

  // lab.test('Fails to update if the email address is taken', done => {
  //   const params = {
  //     facebookId: "111222333444555",
  //     email: "player3@email.com",
  //     displayName: "My new name"
  //   };
  //
  //   server.inject({method: 'POST', url: url, payload: params}, res => {
  //     res.statusCode.should.equal(200);
  //
  //     const payload = JSON.parse(res.payload);
  //     payload.should.have.property('token').that.is.not.empty;
  //     payload.should.have.property('player').that.is.an('object');
  //     payload.player.should.have.property('id').that.equals(player1.id);
  //     payload.player.should.have.property('email').that.equals('player1@email.com');
  //     payload.player.should.have.property('displayName').that.equals(params.displayName);
  //     payload.player.should.have.property('facebookId').that.equals(params.facebookId);
  //     payload.player.should.not.have.property('password');
  //
  //     done();
  //   });
  // });

  lab.test('Links existing doodle monster account', done => {
    const params = {
      facebookId: "999888777666555",
      email: "player3@email.com",
      displayName: "Barry Johnson"
    };

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.equals(player3.id);
      payload.player.should.have.property('email').that.equals(player3.email);
      payload.player.should.have.property('displayName').that.equals(player3.displayName);
      payload.player.should.have.property('facebookId').that.equals(params.facebookId);
      payload.player.should.not.have.property('password');

      done();
    });
  });
});
