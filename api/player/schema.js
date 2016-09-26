'use strict';

const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
  email: String,
  password: String,
  displayName: String,
  facebookId: String
});
if (!playerSchema.options.toObject) {
  playerSchema.options.toObject = {};
}
playerSchema.options.toObject.transform = function (doc, ret, options) {
  ret.id = doc.id;
  delete ret._id;
  delete ret.password;
};
playerSchema.options.toObject.versionKey = false;

const Player = mongoose.model('Player', playerSchema);