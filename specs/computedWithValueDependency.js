var expect = require('chai').expect;
var itDepends = require('../out/build/itDepends.js').itDepends;

describe('computed with value dependency', function () {
	var callCount;
	var observableValue;
	var computedValue;

	beforeEach(function(){
		callCount = 0;

		observableValue = itDepends.value('Bob');

		computedValue = itDepends.computed(function(){
			callCount++;
			return 'Hello, ' + observableValue();
		});
	});

	it('should not calculate when created', function () {
		expect(callCount).to.equal(0);
	});

	it('should calculate when requested', function () {
		var actualValue = computedValue();
		expect(actualValue).to.equal('Hello, Bob');
	});

	it('should calculate once when requested more than once', function () {
		computedValue();
		var actualValue = computedValue();
		expect(actualValue).to.equal('Hello, Bob');
		expect(callCount).to.equal(1);
	});

	context('after dependency value was changed', function () {
		beforeEach(function(){
			callCount = 0;
			observableValue('Jack');
		});

		it('should not calculate when created', function () {
			expect(callCount).to.equal(0);
		});

		it('should calculate when requested', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Jack');
		});

		it('should calculate once when requested more than once', function () {
			computedValue();
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Jack');
			expect(callCount).to.equal(1);
		});

	});

});