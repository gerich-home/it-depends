var expect = require('chai').expect;
var itDepends = require('../../out/build/it-depends.js');

describe('itDepends library', function () {

  it('loads in test runner', function () {
    expect(itDepends).to.not.be.undefined;
    expect(itDepends.value).to.be.instanceof(Function);
    expect(itDepends.promiseValue).to.be.instanceof(Function);
    expect(itDepends.computed).to.be.instanceof(Function);
  });

});
