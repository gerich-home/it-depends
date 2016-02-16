mocha.setup('bdd');
var expect = chai.expect;

describe('itDepends library included as script tag', function () {

  it('loads in global object and gets initialized properly', function () {
    expect(itDepends).to.not.be.undefined;
    expect(itDepends.value).to.be.instanceof(Function);
    expect(itDepends.promiseValue).to.be.instanceof(Function);
    expect(itDepends.computed).to.be.instanceof(Function);
  });

});