'use strict';

process.env.NODE_ENV = 'test';

const lab = require('lab').script();

const chai = require('chai');
chai.use(require('chai-datetime'));
chai.use(require('chai-fs'));
chai.should();

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const mockgoose = require('mockgoose');
mockgoose(mongoose).then(() => {
  mongoose.connect('mongodb://localhost/TestingDB');
});
lab.after(done => {
  mongoose.unmock(done);
});
lab.afterEach(done => {
  mockgoose.reset(done);
});

const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({routes: {validate: {options: {stripUnknown: true}}}});
require('../api/player')(server);
require('../api/auth')(server);
require('../api/monster')(server);
server.start(() => {});

exports.lab = lab;
exports.server = server;
exports.helper = require('./helper');
