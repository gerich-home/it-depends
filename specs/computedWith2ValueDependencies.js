var expect = require('chai').expect;
var itDepends = require('../out/build/it-depends.js');

describe('computed with 2 value dependencies', function () {
	var calls;
	var observableValue1;
	var observableValue2;
	var computedValue;

	beforeEach(function(){
		var counter = { count: 0};
		calls = counter;

		observableValue1 = itDepends.value('Hello');
		observableValue2 = itDepends.value('Bob');

		computedValue = itDepends.computed(function(){
			counter.count++;
			return observableValue1() + ', ' + observableValue2();
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

		it('should not calculate second time if value dependencies were not changed', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Hello, Bob');
			expect(calls.count).to.equal(1);
		});
		
		context('after the first value dependency was changed', function () {
			beforeEach(function(){
				observableValue1.write('Bonjour');
			});

			it('should not recalculate immediately', function () {
				expect(calls.count).to.equal(1);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Bob');
				expect(calls.count).to.equal(2);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Bob');
					expect(calls.count).to.equal(2);
				});
				
			});

			context('after the first value dependency was changed back immediatelly', function () {
				beforeEach(function(){
					observableValue1.write('Hello');
				});

				it('should not recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Hello, Bob');
					expect(calls.count).to.equal(1);
				});
			});

			context('after the second value dependency was changed', function () {
				beforeEach(function(){
					observableValue2.write('Jack');
				});

				it('should not recalculate immediately', function () {
					expect(calls.count).to.equal(1);
				});

				it('should recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(calls.count).to.equal(2);
				});
				
				context('after was recalculated', function () {
					beforeEach(function(){
						computedValue();
					});

					it('should not calculate second time if value dependencies were not changed', function () {
						var actualValue = computedValue();
						expect(actualValue).to.equal('Bonjour, Jack');
						expect(calls.count).to.equal(2);
					});
					
				});
			});
		});

		context('after the second value dependency was changed', function () {
			beforeEach(function(){
				observableValue2.write('Jack');
			});

			it('should not recalculate immediately', function () {
				expect(calls.count).to.equal(1);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(calls.count).to.equal(2);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Hello, Jack');
					expect(calls.count).to.equal(2);
				});
				
			});

			context('after the second value dependency was changed back immediatelly', function () {
				beforeEach(function(){
					observableValue2.write('Bob');
				});

				it('should not recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Hello, Bob');
					expect(calls.count).to.equal(1);
				});
			});
			
			context('after the first value dependency was changed', function () {
				beforeEach(function(){
					observableValue1.write('Bonjour');
				});

				it('should not recalculate immediately', function () {
					expect(calls.count).to.equal(1);
				});

				it('should recalculate when requested', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(calls.count).to.equal(2);
				});
				
				context('after was recalculated', function () {
					beforeEach(function(){
						computedValue();
					});

					it('should not calculate second time if value dependencies were not changed', function () {
						var actualValue = computedValue();
						expect(actualValue).to.equal('Bonjour, Jack');
						expect(calls.count).to.equal(2);
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
			expect(calls.count).to.equal(0);
		});

		it('should recalculate when requested', function () {
			var actualValue = computedValue();
			expect(actualValue).to.equal('Bonjour, Bob');
			expect(calls.count).to.equal(1);
		});
		
		context('after was recalculated', function () {
			beforeEach(function(){
				computedValue();
			});

			it('should not calculate second time if value dependencies were not changed', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Bob');
				expect(calls.count).to.equal(1);
			});
			
		});

		context('after the second value dependency was changed', function () {
			beforeEach(function(){
				observableValue2.write('Jack');
			});

			it('should not recalculate immediately', function () {
				expect(calls.count).to.equal(0);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Jack');
				expect(calls.count).to.equal(1);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(calls.count).to.equal(1);
				});
				
			});
		});
	});

	context('after the second value dependency was changed', function () {
		beforeEach(function(){
			observableValue2.write('Jack');
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

			it('should not calculate second time if value dependencies were not changed', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Hello, Jack');
				expect(calls.count).to.equal(1);
			});
			
		});
		
		context('after the first value dependency was changed', function () {
			beforeEach(function(){
				observableValue1.write('Bonjour');
			});

			it('should not recalculate immediately', function () {
				expect(calls.count).to.equal(0);
			});

			it('should recalculate when requested', function () {
				var actualValue = computedValue();
				expect(actualValue).to.equal('Bonjour, Jack');
				expect(calls.count).to.equal(1);
			});
			
			context('after was recalculated', function () {
				beforeEach(function(){
					computedValue();
				});

				it('should not calculate second time if value dependencies were not changed', function () {
					var actualValue = computedValue();
					expect(actualValue).to.equal('Bonjour, Jack');
					expect(calls.count).to.equal(1);
				});
				
			});
		});
		
	});

});
