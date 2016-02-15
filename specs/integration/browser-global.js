mocha.setup('bdd');
var expect = chai.expect;

describe('itDepends library', function () {

  it('loads in browser in global object', function () {
    expect(itDepends).to.not.be.undefined;
    expect(itDepends.value).to.be.instanceof(Function);
    expect(itDepends.promiseValue).to.be.instanceof(Function);
    expect(itDepends.computed).to.be.instanceof(Function);
  });

});