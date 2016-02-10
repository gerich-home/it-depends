var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js').itDepends;

describe('computed with single value dependency', function () {
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

	context('after was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate second time if value dependency was not changed', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Bob');
			expect(callCount).to.equal(1);
		});
		
		context('after value dependency was changed', function () {
			beforeEach(function(){
				observableValue.write('Jack');
			});

			it('should not recalculate immediately', function () {
				expect(callCount).to.equal(1);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(callCount).to.equal(2);
			});
		});
	});

	context('after value dependency was changed', function () {
		beforeEach(function(){
			observableValue.write('Jack');
		});

		it('should not recalculate immediately', function () {
			expect(callCount).to.equal(0);
		});

		it('should recalculate when requested', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Jack');
			expect(callCount).to.equal(1);
		});
		
		context('after was recalculated', function () {
			beforeEach(function(){
				computedValue();
			});

			it('should not calculate second time if value dependency was not changed', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(callCount).to.equal(1);
			});
			
		});
		
	});

});
