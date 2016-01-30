mocha.setup('bdd');
var expect = chai.expect;

describe('itDepends library', function () {

  it('loads in test runner', function () {
    expect(itDepends).to.not.be.undefined;
  });

});