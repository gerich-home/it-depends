var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js').itDepends;

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

	context('when was calculated once', function () {
		beforeEach(function(){
			computedValue();
			expect(callCount).to.equal(1);
		});

		it('should not calculate second time if dependency value was not changed', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Bob');
			expect(callCount).to.equal(1);
		});
	});

	context('after dependency value was changed', function () {
		beforeEach(function(){
			observableValue('Jack');
		});

		it('should not calculate', function () {
			expect(callCount).to.equal(0);
		});

		it('should calculate when requested', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Jack');
			expect(callCount).to.equal(1);
		});

		it('should calculate once when requested more than once', function () {
			computedValue();
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Jack');
			expect(callCount).to.equal(1);
		});

	});

});
