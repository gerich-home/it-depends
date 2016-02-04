var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js').itDepends;

describe('computed with no dependencies', function () {
	var callCount;
    var computedValue;
	
	beforeEach(function(){
		callCount = 0;
		
		computedValue = itDepends.computed(function(){
			callCount++;
			return 'Bob';
		});
	});

  it('should not calculate when created', function () {
	expect(callCount).to.equal(0);
  });

  it('should calculate when requested', function () {
	var actualValue = computedValue();
	expect(actualValue).to.equal('Bob');
  });

  it('should calculate once when requested more than once', function () {
	computedValue();
	var actualValue = computedValue();
	expect(actualValue).to.equal('Bob');
	expect(callCount).to.equal(1);
  });
});
