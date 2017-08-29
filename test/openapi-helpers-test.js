'use strict';

// The hinter will deny a lot of the chai syntax (W030).
/* jshint ignore:start */

// Dependencies.
var openApiHelpers = require('../lib/openapi-helpers');
var chai = require('chai');
var expect = chai.expect;
var openApiObject = require('./fixtures/openApiObject.json');
var testData = require('./fixtures/testData');

describe('openapi-helpers submodule', function () {

  it('should have a method addDataToOpenApiObject()', function (done) {
    expect(openApiHelpers).to.include.keys('addDataToOpenApiObject');
    expect(typeof(openApiHelpers.addDataToOpenApiObject)).to.equal('function');
    done();
  });

  it('addDataToOpenApiObject() should require correct input', function (done) {
    expect(openApiHelpers.addDataToOpenApiObject).to.throw(Error);
    done();
  });

  it('addDataToOpenApiObject() handles "component" and "components"', function(done) {
    openApiHelpers.addDataToOpenApiObject(openApiObject, testData.components);
    expect(openApiObject.components).to.exist;
    // Case 'component'.
    expect(openApiObject.components).to.include.keys('DefinitionSingular');
    // Case 'components'.
    expect(openApiObject.components).to.include.keys('DefinitionPlural');
    done();
  });

  it('should have a method openApizeObj()', function (done) {
    expect(openApiHelpers).to.include.keys('openApizeObj');
    expect(typeof(openApiHelpers.openApizeObj)).to.equal('function');
    done();
  });
  it('swagerizeObj should remove keys specified from the blacklisted keys', function (done) {
      var testObject = {
          valid: 'Valid Key',
          apis: 'Invalid Key'
      }
      testObject = openApiHelpers.openApizeObj(testObject);
      expect(testObject.apis).to.be.undefined;
      done();
  });

});
/* jshint ignore:end */
