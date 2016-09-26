'use strict';

const bootstrap = require('../bootstrap');
const lab = bootstrap.lab;
const server = bootstrap.server;
const helper = bootstrap.helper;
const should = require('chai').should();
const expect = require('chai').expect;
const Boom = require('boom');
const fs = require('fs');
const moment = require('moment');

lab.experiment('POST /monster', () => {
  const url = '/monster';
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

lab.experiment('GET /me/monsters', () => {
  const url = '/me/monsters';
  var player1, player2, player3, player4;
  var monster1, monster2;
  var imageData;
  var thumbnailData;

  lab.beforeEach(done => {
    imageData = fs.readFileSync(__dirname + '/chill-out.png', {encoding: 'base64'});
    thumbnailData = fs.readFileSync(__dirname + '/thumbnail.png', {encoding: 'base64'});

    helper
      .createPlayer({email: 'player1@email.com'})
      .then(p => player1 = p)
      .then(() => helper.createPlayer({email: 'player2@email.com'}))
      .then(p => player2 = p)
      .then(() => helper.createPlayer({email: 'player3@email.com'}))
      .then(p => player3 = p)
      .then(() => helper.createPlayer({email: 'player4@email.com'}))
      .then(p => player4 = p)
      .then(() => {
        return helper
          .aMonster()
          .withStartingPlayerId(player1.id)
          .withOtherPlayerIds([player2.id, player3.id])
          .withImageData(imageData)
          .withThumbnail(thumbnailData)
          .build()
      })
      .then(m => monster1 = m)
      .then(() => {
        return helper
          .aMonster()
          .withStartingPlayerId(player2.id)
          .withOtherPlayerIds([player3.id, player1.id])
          .build()
      })
      .then(m => monster2 = m)
      .then(() => {
        return helper
          .aMonster()
          .withStartingPlayerId(player4.id)
          .withOtherPlayerIds([player3.id, player2.id])
          .build()
      })
      .then(() => {
        return helper
          .aMonster()
          .withStartingPlayerId(player1.id)
          .withOtherPlayerIds([player2.id, player3.id])
          .thatIsFinished()
          .build()
      })
      .then(() => done()).catch(done);
  });

  lab.test('Returns my active monsters', done => {
    server.inject({method: 'GET', url: url, credentials: player1}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.be.an('array').with.lengthOf(2);

      const first = payload[0];
      first.should.have.property('id').that.equals(monster1.id);
      first.should.not.property('imageData');
      first.should.have.property('thumbnail').that.equals(monster1.thumbnail);

      const second = payload[1];
      second.should.have.property('id').that.equals(monster2.id);

      payload.should.include(monster2);

      done();
    });
  });
});

lab.experiment('GET /monster/{monsterId}', () => {
  var player1, player2, player3;
  var monster1;
  var imageData;
  var thumbnailData;

  lab.beforeEach(done => {
    imageData = fs.readFileSync(__dirname + '/chill-out.png', {encoding: 'base64'});
    thumbnailData = fs.readFileSync(__dirname + '/thumbnail.png', {encoding: 'base64'});

    helper
      .createPlayer({email: 'player1@email.com'})
      .then(p => player1 = p)
      .then(() => helper.createPlayer({email: 'player2@email.com'}))
      .then(p => player2 = p)
      .then(() => helper.createPlayer({email: 'player3@email.com'}))
      .then(p => player3 = p)
      .then(() => {
        return helper
          .aMonster()
          .withStartingPlayerId(player1.id)
          .withOtherPlayerIds([player2.id, player3.id])
          .withImageData(imageData)
          .withThumbnail(thumbnailData)
          .build()
      })
      .then(m => monster1 = m)
      .then(() => done()).catch(done);
  });

  lab.test('Returns the full monster', done => {
    const url = '/monster/' + monster1.id;

    server.inject({method: 'GET', url: url, credentials: player1}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);
      payload.should.be.an('object');
      payload.should.have.property('id').that.is.not.empty;
      payload.should.have.property('currentPlayerNumber').that.equals(0);
      payload.should.have.property('turnCount').that.equals(0);
      payload.should.have.property('gameOver').that.is.falsy;
      payload.should.have.property('name').that.equals("");
      payload.should.not.have.property('lastTurn');
      payload.should.have.property('imageData').that.equals(monster1.imageData);
      payload.should.have.property('thumbnail').that.equals(monster1.thumbnail);

      payload.should.have.property('players').that.is.an('array').with.lengthOf(3);
      payload.players[0].should.deep.equal(player1);
      payload.players[1].should.deep.equal(player2);
      payload.players[2].should.deep.equal(player3);

      done();
    });
  });

  lab.test('Returns 404 if the monster cannot be found', done => {
    const url = "/monster/" + require('mongoose').Types.ObjectId();

    server.inject({method: 'GET', url: url, credentials: player1}, res => {
      res.statusCode.should.equal(404);
      const payload = JSON.parse(res.payload);
      payload.should.deep.equal(Boom.notFound().output.payload);
      done();
    });
  });
});

lab.experiment('POST /monster/{monsterId}/turns', () => {
  var player1, player2, player3;
  var monster;

  lab.beforeEach(done => {
    helper
      .createPlayer({email: 'player1@email.com'})
      .then(p => player1 = p)
      .then(() => helper.createPlayer({email: 'player2@email.com'}))
      .then(p => player2 = p)
      .then(() => helper.createPlayer({email: 'player3@email.com'}))
      .then(p => player3 = p)
      .then(() => {
        return helper
          .aMonster()
          .withStartingPlayerId(player1.id)
          .withOtherPlayerIds([player2.id, player3.id])
          .build()
      })
      .then(m => monster = m)
      .then(() => done()).catch(done);
  });

  lab.test('Adds a new turn and advances to the next player', done => {
    const url = '/monster/' + monster.id + '/turns';
    const imageData = fs.readFileSync(__dirname + '/chill-out.png', {encoding: 'base64'});
    const thumbnailData = fs.readFileSync(__dirname + '/thumbnail.png', {encoding: 'base64'});

    const params = {
      imageData: imageData,
      letter: "F"
    };

    server.inject({method: 'POST', url: url, payload: params, credentials: player1}, res => {
      res.statusCode.should.equal(200);

      const payload = JSON.parse(res.payload);

      payload.should.have.property('id').that.equals(monster.id);
      payload.should.have.property('currentPlayerNumber').that.equals(1);
      payload.should.have.property('turnCount').that.equals(1);
      payload.should.have.property('gameOver').that.is.falsy;
      payload.should.have.property('name').that.equals("F");
      payload.should.have.property('imageData').that.equals(imageData);
      payload.should.have.property('thumbnail').that.equals(thumbnailData);

      // lastTurn must have been set to roughly now-ish (my threshold is up to 5 seconds before now)
      payload.should.have.property('lastTurn');
      should.equal(moment(payload.lastTurn).isValid(), true);
      moment(payload.lastTurn).toDate().should.be.beforeTime(new Date());
      moment(payload.lastTurn).toDate().should.be.afterTime(moment().subtract(5, 'seconds').toDate());

      payload.should.have.property('players').that.is.an('array').with.lengthOf(3);
      payload.players[0].should.deep.equal(player1);
      payload.players[1].should.deep.equal(player2);
      payload.players[2].should.deep.equal(player3);

      done();
    });
  });
});