'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');

const monsterSchema = Schema({
  players: [{type: Schema.Types.ObjectId, ref: "Player"}],
  name: String,
  lastTurn: Date,
  currentPlayerNumber: Number,
  gameOver: Boolean,
  imageData: {type: Buffer, select: false},
  thumbnail: Buffer,
  turnCount: Number
});

if (!monsterSchema.options.toObject) {monsterSchema.options.toObject = {};}
monsterSchema.options.toObject.transform = function (doc, ret, options) {
  ret.id = doc.id;
  delete ret._id;

  if (doc.thumbnail) {
    ret.thumbnail = doc.thumbnail.toString("base64");
  }
  if (doc.imageData) {
    ret.imageData = doc.imageData.toString("base64");
  }
};
monsterSchema.options.toObject.versionKey = false;

// Model Methods

let gameOverChart = {
  1: 10,
  2: 10,
  3: 12,
  4: 12,
  5: 10,
  6: 12,
  7: 7,
  8: 8
};

monsterSchema.virtual('gameOverChart').get(function () {
  return gameOverChart;
});

monsterSchema.virtual('gameOverChart').set(function (newChart) {
  gameOverChart = newChart;
});

monsterSchema.methods.createMonster = function(startingPlayerId, otherPlayerIds) {
  this.currentPlayerNumber = 0;
  this.turnCount = 0;
  this.gameOver = false;
  this.name = "";

  let playerIds = otherPlayerIds;
  playerIds.unshift(startingPlayerId);
  this.players = _.uniq(playerIds);
};

monsterSchema.methods.addTurn = function(playerId, imageData, letter, now) {
  // todo make sure the given playerId is allowed to save

  this.imageData = imageData;
  this.lastTurn = now;
  this.turnCount += 1;

  if (this.name) {
    this.name += letter;
  } else {
    this.name = letter;
  }

  if (this.isGameOver()) {
    this.gameOver = true;
  } else {
    this.currentPlayerNumber += 1;
    if (this.currentPlayerNumber >= this.players.length) {
      this.currentPlayerNumber = 0;
    }
  }
};

monsterSchema.methods.isGameOver = function() {
  return this.turnCount >= this.gameOverChart[this.players.length];
};


const Monster = mongoose.model('Monster', monsterSchema);
