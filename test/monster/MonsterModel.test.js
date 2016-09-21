'use strict';

const lab = exports.lab = require('lab').script();
require('../../api/monster/schema');
const mongoose = require('mongoose');
const Monster = require('mongoose').model('Monster');
const expect = require('chai').expect;
const sinon = require('sinon');

lab.experiment('Monster', () => {
  var player1, player2, player3;
  var monster;

  lab.beforeEach(done => {
    player1 = mongoose.Types.ObjectId();
    player2 = mongoose.Types.ObjectId();
    player3 = mongoose.Types.ObjectId();

    monster = new Monster();

    done();
  });

  lab.experiment('#createMonster', () => {
    lab.test('sets current player number to zero', done => {
      monster.createMonster(player1, [player2, player3]);
      expect(monster.currentPlayerNumber).to.equal(0);
      done();
    });

    lab.test('sets the turn count to zero', done => {
      monster.createMonster(player1, [player2, player3]);
      expect(monster.turnCount).to.equal(0);
      done();
    });

    lab.test('sets game over to false', done => {
      monster.createMonster(player1, [player2, player3]);
      expect(monster.gameOver).to.equal(false);
      done();
    });

    lab.test('puts the starting player at the top of the player list', done => {
      monster.createMonster(player1, [player2, player3]);

      expect(monster.players).to.have.lengthOf(3);
      expect(monster.players[0]).to.equal(player1);
      expect(monster.players[1]).to.equal(player2);
      expect(monster.players[2]).to.equal(player3);

      done();
    });

    // lab.test('removes duplicate player ids', () => {
    //
    // });

    // lab.test("throws a validation error if given ids that aren't real player ids", done => {
    //
    // });
  });

  lab.experiment('#addTurn', () => {
    let imageData;
    let now;
    let stub;

    lab.beforeEach(done => {
      monster.createMonster(player1, [player2, player3]);
      imageData = new Buffer('AZADFSDFGV');
      now = new Date();
      stub = sinon.stub(Monster.prototype, "isGameOver");
      done();
    });

    lab.afterEach(done => {
      stub.restore();
      done();
    });

    lab.test('updates the image data', done => {
      monster.addTurn(player1, imageData, 'W', now);
      expect(monster.imageData).to.deep.equal(imageData);
      done();
    });

    lab.test('appends the letter to the monster name', done => {
      monster.name = 'Jef';
      monster.addTurn(player1, imageData, 'f', now);
      expect(monster.name).to.equal('Jeff');
      done();
    });

    lab.test('first turn sets the monster name to the letter', done => {
      monster.addTurn(player1, imageData, 'F', now);
      expect(monster.name).to.equal('F');
      done();
    });

    lab.test('sets lastTurn to the current date and time', done => {
      monster.addTurn(player1, imageData, 'W', now);
      expect(monster.lastTurn).to.deep.equal(now);
      done();
    });

    lab.test('increments the current player number', done => {
      monster.addTurn(player1, imageData, 'W', now);
      expect(monster.currentPlayerNumber).to.equal(1);
      done();
    });

    lab.test('if the last player just went, wrap back to the first player again', done => {
      monster.addTurn(player1, imageData, 'W', now);
      monster.addTurn(player2, imageData, 'W', now);
      monster.addTurn(player3, imageData, 'W', now);

      expect(monster.currentPlayerNumber).to.equal(0);

      done();
    });
    
    lab.test('does not change the current player number if the game has just ended', done => {
      stub.returns(true);
      monster.addTurn(player1, imageData, 'W', now);
      expect(monster.currentPlayerNumber).to.equal(0);
      done();
    });

    lab.test('marks the game finished if this was the last turn', done => {
      stub.returns(true);
      monster.addTurn(player1, imageData, 'W', now);
      expect(monster.gameOver).to.equal(true);
      done();
    });

    lab.test('increments the turn counter', done => {
      monster.addTurn(player1, imageData, 'W', now);
      expect(monster.turnCount).to.equal(1);
      done();
    });
  });
  
  lab.experiment('#isGameOver', () => {
    lab.test('is over when the player count and turn count matches one of the entries in the game over chart', done => {
      monster.gameOverChart = {3: 6};
      monster.createMonster(player1, [player2, player3]);
      monster.turnCount = 6;

      expect(monster.isGameOver()).to.equal(true);

      done();
    });
    
    lab.test('is not over if the required number of turns have not been completed', done => {
      monster.gameOverChart = {3: 6};
      monster.createMonster(player1, [player2, player3]);
      monster.turnCount = 5;

      expect(monster.isGameOver()).to.equal(false);

      done();
    });
  });
});