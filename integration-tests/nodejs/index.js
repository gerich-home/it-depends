var expect = require('chai').expect;
var itDepends = require('../../out/dist/it-depends.js');

describe('itDepends library required in NodeJS environment', function () {

  it('loads and gets initialized properly', function () {
    expect(itDepends).to.not.be.undefined;
    expect(itDepends.value).to.be.instanceof(Function);
    expect(itDepends.promiseValue).to.be.instanceof(Function);
    expect(itDepends.computed).to.be.instanceof(Function);
  });

});
