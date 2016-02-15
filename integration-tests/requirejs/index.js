mocha.setup('bdd');
var expect = chai.expect;

describe('itDepends library', function () {

  it('loads in RequireJs', function (done) {
	requirejs(['it-depends'], function(itDepends) {
		expect(itDepends).to.not.be.undefined;
		expect(itDepends.value).to.be.instanceof(Function);
		expect(itDepends.promiseValue).to.be.instanceof(Function);
		expect(itDepends.computed).to.be.instanceof(Function);
		
		done();
	});
  });

});