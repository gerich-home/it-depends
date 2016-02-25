var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');
var _ = require('lodash');

describe('parameteric computed with single value dependency', function () {
	var callCounts;
	var observableValues;
	var computedValue;

	var expectCalls = function(expectedCounts) {
		var expectedKeys = _.keys(expectedCounts);
		var actualKeys = _.keys(callCounts);
		
		for(var key in _.union(expectedKeys, actualKeys)) {
			expect(callCounts[key] || 0).to.equal(expectedCounts[key] || 0);
		}
	};
	
	beforeEach(function(){
		var counter = {};
		callCounts = counter;

		observableValues = {
			quickFox: itDepends.value('Bob'),
			lazyDog: itDepends.value('James'),
			anonymous: itDepends.value('Incognito'),
		};

		computedValue = itDepends.computed(function(userId) {
			if(userId === undefined) {
				userId = 'anonymous';
			}
			
			counter[userId] = (counter[userId] || 0) + 1;
			return 'Hello, ' + observableValues[userId]();
		});
	});

	var describeCalledWithParameters = function(expectCalls, args) {
		context('with parameters ' + JSON.stringify(args), function () {
			it('should not calculate when created', function () {
				expectCalls({});
			});
			
			it('should calculate when requested', function () {
				var actualValue = computedValue.call(args);
				expect(actualValue).to.equal('Hello, Incognito');
				expectCalls({
					anonymous: 1
				});
			});

			context('after was calculated once', function () {
				beforeEach(function(){
					computedValue.call(args);
				});

				it('should not calculate second time if value dependency was not changed', function () {
					var actualValue = computedValue.call(args);
					expect(actualValue).to.equal('Hello, Incognito');
					expectCalls({
						anonymous: 1
					});
				});
				
				context('after value dependency was changed', function () {
					beforeEach(function(){
						observableValues.anonymous.write('Jack');
					});

					it('should not recalculate immediately', function () {
						expectCalls({
							anonymous: 1
						});
					});

					it('should recalculate when requested', function () {
						var actualValue = computedValue.call(args);
						expect(actualValue).to.equal('Hello, Jack');
						expectCalls({
							anonymous: 2
						});
					});

					context('after value dependency was changed back immediatelly', function () {
						beforeEach(function(){
							observableValues.anonymous.write('Incognito');
						});

						it('should not recalculate when requested', function () {
							var actualValue = computedValue.call(args);
							expect(actualValue).to.equal('Hello, Incognito');
							expectCalls({
								anonymous: 1
							});
						});
					});
				});
			});

			context('after value dependency was changed', function () {
				beforeEach(function(){
					observableValues.anonymous.write('Jack');
				});

				it('should not recalculate immediately', function () {
					expectCalls({});
				});

				it('should recalculate when requested', function () {
					var actualValue = computedValue.call(args);
					expect(actualValue).to.equal('Hello, Jack');
					expectCalls({
						anonymous: 1
					});
				});
				
				context('after was recalculated', function () {
					beforeEach(function(){
						computedValue.call(args);
					});

					it('should not calculate second time if value dependency was not changed', function () {
						var actualValue = computedValue.call(args);
						expect(actualValue).to.equal('Hello, Jack');
						expectCalls({
							anonymous: 1
						});
					});
					
				});
				
			});
		});
	};
	
	describeCalledWithParameters(expectCalls, []);

	context('after was called with a parameter', function () {
		beforeEach(function(){
			computedValue('quickFox');
		});
		
		describeCalledWithParameters(function(expected) {
			expectCalls(_.defaults({
				quickFox: 1
			}, expected));
		}, []);
	});

});
