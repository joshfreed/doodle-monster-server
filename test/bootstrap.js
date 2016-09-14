'use strict';

process.env.NODE_ENV = 'test';

const lab = require('lab').script();
const server = require('../server');
const helper = require('./helper');
const mongoose = require('mongoose');
const mockgoose = require('mockgoose');

const chai = require('chai');
chai.should();

lab.before(done => {
  mockgoose(mongoose).then(function() {
    mongoose.connect('mongodb://localhost/TestingDB', done);
  });
});

lab.after(done => {
  mongoose.unmock(done);
});

lab.afterEach(done => {
  mockgoose.reset(done);
});

exports.lab = lab;
exports.server = server;
exports.helper = helper;
