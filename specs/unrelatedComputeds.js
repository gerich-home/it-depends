var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js').itDepends;

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
		var helloBob = unrelatedComputed();
		expect(callCount).to.equal(0);
	});

	it('should not calculate when other computed value changes', function () {
		unrelatedValue('Jack');
		var helloJack = unrelatedComputed();
		expect(callCount).to.equal(0);
	});
	
	context('when was calculated once', function () {
		beforeEach(function(){
			var hello = computedValue();
			expect(callCount).to.equal(1);
		});

		it('should not calculate when other computed is calculated', function () {
			var helloBob = unrelatedComputed();
			expect(callCount).to.equal(1);
		});

		it('should not calculate when other computed value changes', function () {
			unrelatedValue('Jack');
			var helloJack = unrelatedComputed();
			expect(callCount).to.equal(1);
		});
	});
});
