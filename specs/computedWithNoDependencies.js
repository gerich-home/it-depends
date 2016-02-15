var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');

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

	context('after was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate second time', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Bob');
			expect(callCount).to.equal(1);
		});
	});
	
});
