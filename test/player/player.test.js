'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;
const Boom = require('boom');

lab.experiment('GET /player/:playerId', () => {
  var expected;

  lab.beforeEach(done => {
    helper
      .createPlayer({email: "player33@email.com", password: "testing123", displayName: "Barry Barryson"})
      .then(p => expected = p)
      .then(() => done()).catch(done);
  });

  lab.test('Returns the player', done => {
    const url = "/api/player/" + expected.id;

    server.inject({method: 'GET', url: url, credentials: {}}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('id').that.equals(expected.id);
      payload.should.have.property('email').that.equals(expected.email);
      payload.should.have.property('displayName').that.equals(expected.displayName);
      payload.should.not.have.property('password');

      done();
    });
  });

  lab.test('Player not found', done => {
    const url = "/api/player/" + require('mongoose').Types.ObjectId();

    server.inject({method: 'GET', url: url, credentials: {}}, res => {
      res.statusCode.should.equal(404);
      const payload = JSON.parse(res.payload);
      payload.should.deep.equal(Boom.notFound().output.payload);
      done();
    });
  });
});
