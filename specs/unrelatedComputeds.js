var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js').itDepends;

describe('computed unrelated to other computed and value', function () {
	var callCount;
	var unrelatedValue;
	var unrelatedComputed;
	var computedValue;

	beforeEach(function(){
		callCount = 0;

		unrelatedValue = itDepends.value('Bob');
		unrelatedComputed = itDepends.computed(function(){
			return 'Hello, ' + unrelatedValue();
		});

		computedValue = itDepends.computed(function(){
			callCount++;
			return 'Hello';
		});
	});

	it('should not calculate when created', function () {
		expect(callCount).to.equal(0);
	});

	it('should not calculate when other computed is calculated', function () {
		unrelatedComputed();
		expect(callCount).to.equal(0);
	});

	it('should not calculate when other computed value changes', function () {
		unrelatedValue.write('Jack');
		unrelatedComputed();
		expect(callCount).to.equal(0);
	});

	it('should calculate when requested', function () {
		var actualValue = computedValue();
		expect(actualValue).to.equal('Hello');
		expect(callCount).to.equal(1);
	});
	
	context('when was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate when other computed is calculated', function () {
			unrelatedComputed();
			expect(callCount).to.equal(1);
		});

		it('should not calculate when other computed value changes', function () {
			unrelatedValue.write('Jack');
			unrelatedComputed();
			expect(callCount).to.equal(1);
		});

		it('should not calculate second time', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello');
			expect(callCount).to.equal(1);
		});
	});
});
