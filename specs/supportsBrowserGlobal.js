mocha.setup('bdd');
var expect = chai.expect;

describe('itDepends library', function () {

  it('loads in browser in global object', function () {
    expect(itDepends).to.not.be.undefined;
    expect(itDepends.value).to.not.be.function;
    expect(itDepends.promiseValue).to.not.be.function;
    expect(itDepends.computed).to.not.be.function;
  });

});