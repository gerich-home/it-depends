var expect = require('chai').expect;
var itDepends = require('../out/build/itDepends.js');;

describe('itDepends library', function () {

  it('loads in test runner', function () {
    expect(itDepends).to.not.be.undefined;
  });

});