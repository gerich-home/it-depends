var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed with single value dependency', function () {
	var calls;
	var observableValue;
	var computedValue;

	beforeEach(function(){
		var counter = { count: 0 };
		calls = counter;
		
		observableValue = itDepends.value('Bob');

		computedValue = itDepends.computed(function(){
			counter.count++;
			return 'Hello, ' + observableValue();
		});
	});

	it('should not calculate when created', function () {
		expect(calls.count).to.equal(0);
	});

	it('should calculate when requested', function () {
		var actualValue = computedValue();
		expect(actualValue).to.equal('Hello, Bob');
		expect(calls.count).to.equal(1);
	});

	context('after was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate second time if value dependency was not changed', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Bob');
			expect(calls.count).to.equal(1);
		});
		
		context('after value dependency was changed', function () {
			beforeEach(function(){
				observableValue.write('Jack');
			});

			it('should not recalculate immediately', function () {
				expect(calls.count).to.equal(1);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(calls.count).to.equal(2);
			});

			context('after value dependency was changed back immediatelly', function () {
				beforeEach(function(){
					observableValue.write('Bob');
				});

				it('should not recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Hello, Bob');
					expect(calls.count).to.equal(1);
				});
			});
		});
	});

	context('after value dependency was changed', function () {
		beforeEach(function(){
			observableValue.write('Jack');
		});

		it('should not recalculate immediately', function () {
			expect(calls.count).to.equal(0);
		});

		it('should recalculate when requested', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Jack');
			expect(calls.count).to.equal(1);
		});
		
		context('after was recalculated', function () {
			beforeEach(function(){
				computedValue();
			});

			it('should not calculate second time if value dependency was not changed', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(calls.count).to.equal(1);
			});
			
		});
		
	});

});
