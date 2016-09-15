'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;
const should = require('chai').should();
const Boom = require('boom');

lab.experiment('POST /monster', () => {
  const url = '/api/monster';
  var player1, player2, player3, player4;

  lab.beforeEach(done => {
    helper
      .createPlayer({email: 'player1@email.com'})
      .then(p => player1 = p)
      .then(() => helper.createPlayer({email: 'player2@email.com'}))
      .then(p => player2 = p)
      .then(() => helper.createPlayer({email: 'player3@email.com'}))
      .then(p => player3 = p)
      .then(() => helper.createPlayer({email: 'player4@email.com'}))
      .then(p => player4 = p)
      .then(() => done()).catch(done);
  });

  lab.test('Creates a new monster', done => {
    const params = {
      playerIds: [player2.id, player3.id, player4.id]
    };

    server.inject({
      method: 'POST',
      url: url,
      payload: params,
      credentials: player1
    }, res => {
      res.statusCode.should.equal(201);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('id').that.is.not.empty;
      payload.should.have.property('currentPlayerNumber').that.equals(0);
      payload.should.have.property('turnCount').that.equals(0);
      payload.should.have.property('gameOver').that.is.falsy;
      payload.should.have.property('name').that.equals("");
      payload.should.not.have.property('lastTurn');
      payload.should.not.have.property('imageData');
      payload.should.not.have.property('thumbnail');

      payload.should.have.property('players').that.is.an('array').with.lengthOf(4);
      payload.players[0].should.deep.equal(player1);
      payload.players[1].should.deep.equal(player2);
      payload.players[2].should.deep.equal(player3);
      payload.players[3].should.deep.equal(player4);

      done();
    });
  });

  lab.test('Ignores duplicate player ids', done => {
    const params = {
      playerIds: [player2.id, player3.id, player2.id, player1.id, player2.id]
    };

    server.inject({
      method: 'POST',
      url: url,
      payload: params,
      credentials: player1
    }, res => {
      res.statusCode.should.equal(201);

      const payload = JSON.parse(res.payload);
      payload.should.have.property('players').that.is.an('array').with.lengthOf(3);
      payload.players[0].should.deep.equal(player1);
      payload.players[1].should.deep.equal(player2);
      payload.players[2].should.deep.equal(player3);

      done();
    });
  });
});