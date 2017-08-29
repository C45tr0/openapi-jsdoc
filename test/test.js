'use strict';


// Dependencies
var request = require('supertest');
var app = require('../example/app');
var openApiSpec = require('./openapi-spec.json');


// Check against saved OpenApi spec
function openApiSpecIsCompliant(res) {
  // Check if result equals expected spec
  if (JSON.stringify(res.body) !== JSON.stringify(openApiSpec)) {
    throw new Error('Returned spec does not equal the expected result');
  }
}

// Testing an example app parsing documentation with openapi-jsdoc.
describe('example app', function () {
  it('homepage returns a success code', function (done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('login authentication returns a success code', function (done) {
    request(app)
      .post('/login')
      .send({
        username: 'user@domain.com',
        password: 'Password',
      })
      .expect(200)
      .end(function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('produced OpenApi spec is as expected', function (done) {
    request(app)
      .get('/api-docs.json')
      .expect(200)
      .expect(openApiSpecIsCompliant)
      .end(function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});
