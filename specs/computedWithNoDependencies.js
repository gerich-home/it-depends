var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed with no dependencies', function () {
	var calls;
	var computedValue;

	beforeEach(function() {
		var counter = { count: 0 };
		calls = counter;

		computedValue = itDepends.computed(function(){
			counter.count++;
			return 'Bob';
		});
	});

	it('should not calculate when created', function () {
		expect(calls.count).to.equal(0);
	});

	it('should calculate when requested', function () {
		var actualValue = computedValue();
		expect(actualValue).to.equal('Bob');
		expect(calls.count).to.equal(1);
	});

	context('after was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate second time', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Bob');
			expect(calls.count).to.equal(1);
		});
	});
	
});
