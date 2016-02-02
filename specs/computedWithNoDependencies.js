var expect = require('chai').expect;
var itDepends = require('../out/build/itDepends.js').itDepends;

describe('computed', function () {
	var callCount;
    var computedValue;
	var value = 10;
	
	beforeEach(function(){
		callCount = 0;
		
		computedValue = itDepends.computed(function(){
			callCount++;
			return value;
		});
	});

  it('should not calculate when created', function () {
	expect(callCount).to.equal(0);
  });

  it('should calculate when requested', function () {
	var actualValue = computedValue();
	expect(actualValue).to.equal(value);
  });

  it('should calculate once when requested more than once', function () {
	computedValue();
	var actualValue = computedValue();
	expect(actualValue).to.equal(value);
	expect(callCount).to.equal(1);
  });
});