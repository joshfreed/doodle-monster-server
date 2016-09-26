'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;
const should = require('chai').should();

lab.experiment('POST /auth/fb', () => {
  const url = "/auth/fb";
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
      .then(() => helper.createPlayer({displayName: "Marty McFly"}))
      .then(() => helper.createPlayer({displayName: "Jim Johnson"}))
      .then(() => done()).catch(done);
  });

  lab.test('Creates a new player the first time they login by facebook', done => {
    const params = {
      accessToken: helper.generateToken()
    };

    const me = {
      id: "78787878787878",
      name: "Greg Smith",
      email: "gsmith@email.com"
    };
    bootstrap.facebook.setMeResponse(params.accessToken, me);

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.not.equals(player1.id);
      payload.player.should.have.property('id').that.not.equals(player3.id);
      payload.player.should.have.property('email').that.equals(me.email);
      payload.player.should.have.property('displayName').that.equals(me.name);
      payload.player.should.have.property('facebookId').that.equals(me.id);
      payload.player.should.not.have.property('password');

      require('mongoose').model('Player')
        .findById(payload.player.id)
        .then(expected => {
          should.exist(expected);
          expected.facebookId.should.equal(me.id);
          done();
        })
        .catch(done);
    });
  });

  lab.test('Can create a new account without an email address', done => {
    const params = {
      accessToken: helper.generateToken()
    };

    const me = {
      id: "78787878787878"
    };
    bootstrap.facebook.setMeResponse(params.accessToken, me);

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.not.equals(player1.id);
      payload.player.should.have.property('id').that.not.equals(player3.id);
      payload.player.should.not.have.property('email');
      payload.player.should.not.have.property('displayName');
      payload.player.should.have.property('facebookId').that.equals(me.id);
      payload.player.should.not.have.property('password');

      done();
    });
  });

  lab.test('Logs the player in if the facebook account was already linked', done => {
    const params = {
      accessToken: helper.generateToken()
    };

    const me = {
      id: "111222333444555"
    };
    bootstrap.facebook.setMeResponse(params.accessToken, me);

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.equals(player1.id);
      payload.player.should.have.property('email').that.equals(player1.email);
      payload.player.should.have.property('displayName').that.equals(player1.displayName);
      payload.player.should.not.have.property('password');

      done();
    });
  });

  lab.test('Updates email and display name of the linked account', done => {
    const params = {
      accessToken: helper.generateToken()
    };

    const me = {
      id: "111222333444555",
      name: "Greg Smith",
      email: "gsmith@email.com"
    };
    bootstrap.facebook.setMeResponse(params.accessToken, me);

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.equals(player1.id);
      payload.player.should.have.property('email').that.equals(me.email);
      payload.player.should.have.property('displayName').that.equals(me.name);
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
      accessToken: helper.generateToken()
    };
    const me = {
      id: "999888777666555",
      email: "player3@email.com"
    };
    bootstrap.facebook.setMeResponse(params.accessToken, me);

    server.inject({method: 'POST', url: url, payload: params}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('token').that.is.not.empty;
      payload.should.have.property('player').that.is.an('object');
      payload.player.should.have.property('id').that.equals(player3.id);
      payload.player.should.have.property('email').that.equals(player3.email);
      payload.player.should.have.property('displayName').that.equals(player3.displayName);
      payload.player.should.have.property('facebookId').that.equals(me.id);
      payload.player.should.not.have.property('password');

      done();
    });
  });
});

