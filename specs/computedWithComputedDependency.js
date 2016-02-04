var expect = require('chai').expect;
var itDepends = require('../out/build/itDepends.js').itDepends;

describe('computed with computed dependency', function () {
	var callCount;
	var otherValue;
	var otherComputed;
	var computedValue;

	beforeEach(function(){
		callCount = 0;

		otherValue = itDepends.value('Bob');
		otherComputed = itDepends.computed(function(){
			return 'mr. ' + otherValue();
		});

		computedValue = itDepends.computed(function(){
			callCount++;
			return 'Hello, ' + otherComputed();
		});
	});

	it('should not calculate when created', function () {
		expect(callCount).to.equal(0);
	});

	it('should not calculate when other computed is calculated', function () {
		var mrBob = otherComputed();
		expect(callCount).to.equal(0);
	});

	it('should not calculate when other computed value changes', function () {
		otherValue('Jack');
		var mrJack = otherComputed();
		expect(callCount).to.equal(0);
	});

	it('should calculate when requested', function () {
		var helloMrBob = computedValue();
		expect(helloMrBob).to.equal('Hello, mr. Bob');
		expect(callCount).to.equal(1);
	});
	
	context('when was calculated once', function () {
		beforeEach(function(){
			var helloMrBob = computedValue();
			expect(callCount).to.equal(1);
		});

		it('should not calculate when other computed is calculated', function () {
			otherValue('Jack');
			var mrJack = otherComputed();
			expect(callCount).to.equal(1);
		});

		it('should not calculate second time when no dependencies were changes', function () {
			var helloMrBob = computedValue();
			expect(helloMrBob).to.equal('Hello, mr. Bob');
			expect(callCount).to.equal(1);
		});

		it('should calculate second time when no dependencies were changes', function () {
			otherValue('Jack');
			var helloMrJack = computedValue();
			expect(helloMrJack).to.equal('Hello, mr. Jack');
			expect(callCount).to.equal(2);
		});
	});
});