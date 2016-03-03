var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed with computed dependency', function () {
	var calls;
	var otherValue;
	var otherComputed;
	var computedValue;

	beforeEach(function(){
		var counter = { count: 0 };
		calls = counter;

		otherValue = itDepends.value('Bob');
		otherComputed = itDepends.computed(function(){
			return 'mr. ' + otherValue();
		});

		computedValue = itDepends.computed(function(){
			counter.count++;
			return 'Hello, ' + otherComputed();
		});
	});

	it('should not calculate when created', function () {
		expect(calls.count).to.equal(0);
	});

	it('should not calculate when computed dependency was calculated', function () {
		otherComputed();
		expect(calls.count).to.equal(0);
	});

	it('should not calculate when computed dependency was changed and recalculated', function () {
		otherValue.write('Jack');
		otherComputed();
		expect(calls.count).to.equal(0);
	});

	it('should calculate when requested', function () {
		var actualValue = computedValue();
		expect(actualValue).to.equal('Hello, mr. Bob');
		expect(calls.count).to.equal(1);
	});
	
	context('after was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate second time if computed dependency was not changed', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, mr. Bob');
			expect(calls.count).to.equal(1);
		});

		it('should not calculate when computed dependency was calculated', function () {
			otherComputed();
			expect(calls.count).to.equal(1);
		});

		context('after computed dependency was changed', function () {
			beforeEach(function(){
				otherValue.write('Jack');
			});
			
			context('after computed dependency was recalculated and changed back immediatelly', function () {
				beforeEach(function(){
					otherComputed();
					otherValue.write('Bob');
				});

				it('should not recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Hello, mr. Bob');
					expect(calls.count).to.equal(1);
				});
			});
			
			it('should not recalculate after computed dependency was recalculated', function () {
				otherComputed();
				expect(calls.count).to.equal(1);
			});

			it('should calculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, mr. Jack');
				expect(calls.count).to.equal(2);
			});
		});
	});
	
	context('after computed dependency was changed', function () {
		beforeEach(function(){
			otherValue.write('Jack');
		});
		
		it('should not recalculate after computed dependency was recalculated', function () {
			otherComputed();
			expect(calls.count).to.equal(0);
		});

		it('should calculate when requested', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, mr. Jack');
			expect(calls.count).to.equal(1);
		});
	
		context('after was calculated once', function () {
			beforeEach(function(){
				computedValue();
			});

			it('should not calculate second time if computed dependency was not changed', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, mr. Jack');
				expect(calls.count).to.equal(1);
			});
		});
	});
});
