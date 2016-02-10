var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js').itDepends;

describe('computed with 2 value dependencies', function () {
	var callCount;
	var observableValue1;
	var observableValue2;
	var computedValue;

	beforeEach(function(){
		callCount = 0;

		observableValue1 = itDepends.value('Hello');
		observableValue2 = itDepends.value('Bob');

		computedValue = itDepends.computed(function(){
			callCount++;
			return observableValue1() + ', ' + observableValue2();
		});
	});

	it('should not calculate when created', function () {
		expect(callCount).to.equal(0);
	});

	it('should calculate when requested', function () {
		var actualValue = computedValue();
		expect(actualValue).to.equal('Hello, Bob');
		expect(callCount).to.equal(1);
	});

	context('after was calculated once', function () {
		beforeEach(function(){
			computedValue();
		});

		it('should not calculate second time if value dependencies were not changed', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Bob');
			expect(callCount).to.equal(1);
		});
		
		context('after the first value dependency was changed', function () {
			beforeEach(function(){
				observableValue1.write('Bonjour');
			});

			it('should not recalculate immediately', function () {
				expect(callCount).to.equal(1);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Bob');
				expect(callCount).to.equal(2);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Bob');
					expect(callCount).to.equal(2);
				});
				
			});

			context('after the second value dependency was changed', function () {
				beforeEach(function(){
					observableValue2.write('Jack');
				});

				it('should not recalculate immediately', function () {
					expect(callCount).to.equal(1);
				});

				it('should recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(callCount).to.equal(2);
				});
				
				context('after was recalculated', function () {
					beforeEach(function(){
						computedValue();
					});

					it('should not calculate second time if value dependencies were not changed', function () {
						var actualValue = computedValue();
						expect(actualValue).to.equal('Bonjour, Jack');
						expect(callCount).to.equal(2);
					});
					
				});
			});
		});

		context('after the second value dependency was changed', function () {
			beforeEach(function(){
				observableValue2.write('Jack');
			});

			it('should not recalculate immediately', function () {
				expect(callCount).to.equal(1);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(callCount).to.equal(2);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Hello, Jack');
					expect(callCount).to.equal(2);
				});
				
			});
			
			context('after the first value dependency was changed', function () {
				beforeEach(function(){
					observableValue1.write('Bonjour');
				});

				it('should not recalculate immediately', function () {
					expect(callCount).to.equal(1);
				});

				it('should recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(callCount).to.equal(2);
				});
				
				context('after was recalculated', function () {
					beforeEach(function(){
						computedValue();
					});

					it('should not calculate second time if value dependencies were not changed', function () {
						var actualValue = computedValue();
						expect(actualValue).to.equal('Bonjour, Jack');
						expect(callCount).to.equal(2);
					});
					
				});
			});
			
		});
	});

	context('after the first value dependency was changed', function () {
		beforeEach(function(){
			observableValue1.write('Bonjour');
		});

		it('should not recalculate immediately', function () {
			expect(callCount).to.equal(0);
		});

		it('should recalculate when requested', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Bonjour, Bob');
			expect(callCount).to.equal(1);
		});
		
		context('after was recalculated', function () {
			beforeEach(function(){
				computedValue();
			});

			it('should not calculate second time if value dependencies were not changed', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Bob');
				expect(callCount).to.equal(1);
			});
			
		});

		context('after the second value dependency was changed', function () {
			beforeEach(function(){
				observableValue2.write('Jack');
			});

			it('should not recalculate immediately', function () {
				expect(callCount).to.equal(0);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Jack');
				expect(callCount).to.equal(1);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(callCount).to.equal(1);
				});
				
			});
		});
	});

	context('after the second value dependency was changed', function () {
		beforeEach(function(){
			observableValue2.write('Jack');
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

			it('should not calculate second time if value dependencies were not changed', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(callCount).to.equal(1);
			});
			
		});
		
		context('after the first value dependency was changed', function () {
			beforeEach(function(){
				observableValue1.write('Bonjour');
			});

			it('should not recalculate immediately', function () {
				expect(callCount).to.equal(0);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Jack');
				expect(callCount).to.equal(1);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(callCount).to.equal(1);
				});
				
			});
		});
		
	});

});
