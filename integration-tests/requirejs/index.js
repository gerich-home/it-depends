mocha.setup('bdd');
var expect = chai.expect;

describe('itDepends library required in RequireJs environment', function () {

  it('loads and gets initialized properly', function (done) {
	requirejs(['it-depends'], function(itDepends) {
		expect(itDepends).to.not.be.undefined;
		expect(itDepends.value).to.be.instanceof(Function);
		expect(itDepends.promiseValue).to.be.instanceof(Function);
		expect(itDepends.computed).to.be.instanceof(Function);
		
		done();
	});
  });

});