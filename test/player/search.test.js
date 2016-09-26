'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;
const should = require('chai').should();
const Boom = require('boom');

lab.experiment('GET /players', () => {
  var url = '/players';
  var player1, player2, player3;

  lab.beforeEach(done => {
    helper
      .createPlayer({email: 'fred@email.com'})
      .then(p => player1 = p)
      .then(() => helper.createPlayer({email: 'jerry@email.com'}))
      .then(p => player2 = p)
      .then(() => helper.createPlayer({email: 'barry@email.com'}))
      .then(p => player3 = p)
      .then(() => done()).catch(done);
  });


  lab.test('Returns all players if no search query is specified', done => {
    server.inject({method: 'GET', url: url}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.be.an('array').with.lengthOf(3);
      payload.should.include(player1);
      payload.should.include(player2);
      payload.should.include(player3);

      done();
    });
  });

  lab.test('Returns players with emails matching any of the search string', done => {
    var url = '/players?email=rry';

    server.inject({method: 'GET', url: url}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.be.an('array').with.lengthOf(2);
      payload.should.include(player2);
      payload.should.include(player3);

      done();
    });
  });
});