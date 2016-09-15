'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
};
monsterSchema.options.toObject.versionKey = false;

const Monster = mongoose.model('Monster', monsterSchema);
