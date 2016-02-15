var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');

describe('itDepends library', function () {

  it('loads in test runner', function () {
    expect(itDepends).to.not.be.undefined;
    expect(itDepends.value).to.not.be.function;
    expect(itDepends.promiseValue).to.not.be.function;
    expect(itDepends.computed).to.not.be.function;
  });

});
