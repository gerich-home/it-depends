var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed unrelated to other computed and value', function () {
	var calls;
	var unrelatedValue;
	var unrelatedComputed;
	var computedValue;

	beforeEach(function() {
		var counter = { count: 0 };
		calls = counter;

		unrelatedValue = itDepends.value('Bob');
		unrelatedComputed = itDepends.computed(function(){
			return 'Hello, ' + unrelatedValue();
		});

		computedValue = itDepends.computed(function(){
			counter.count++;
			return 'Hello';
		});
	});

	it('should not calculate when created', function () {
		expect(calls.count).to.equal(0);
	});

	it('should not calculate when other computed is calculated', function () {
		unrelatedComputed();
		expect(calls.count).to.equal(0);
	});

	it('should not calculate when other computed value changes', function () {
		unrelatedValue.write('Jack');
		unrelatedComputed();
		expect(calls.count).to.equal(0);
	});

	it('should calculate when requested', function () {
		var actualValue = computedValue();
		expect(actualValue).to.equal('Hello');
		expect(calls.count).to.equal(1);
	});
	
	context('when was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate when other computed is calculated', function () {
			unrelatedComputed();
			expect(calls.count).to.equal(1);
		});

		it('should not calculate when other computed value changes', function () {
			unrelatedValue.write('Jack');
			unrelatedComputed();
			expect(calls.count).to.equal(1);
		});

		it('should not calculate second time', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello');
			expect(calls.count).to.equal(1);
		});
	});
});
