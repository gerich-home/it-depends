var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');
var _ = require('lodash');

describe('parameteric computed with single value dependency', function () {
	var callCounts;
	var observableValues;
	var computedValue;

	var expectCalls = function(expectedCountPairs) {
		var expectedCounts = _.zipObject(expectedCountPairs);
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

	var withParametersSpecName = function(value) {
		if(value) {
			return 'with parameter ' + value;
		}
		
		return 'with no parameters';
	};
	
	var describeUsageSyntax = function(invokeComputed) {
		var describeCalledWithParameters = function(expectCalls, parameterValue, parameterName) {
			var parameters = [parameterValue];
			var observableValue;
			var originalValue;
			
			context(withParametersSpecName(parameterValue), function () {
				beforeEach(function(){
					observableValue = observableValues[parameterName];
					originalValue = observableValue();
				});
			
				it('should not calculate when created', function () {
					expectCalls([]);
				});
				
				it('should calculate when requested', function () {
					var actualValue = invokeComputed(parameters);
					expect(actualValue).to.equal('Hello, ' + originalValue);
					expectCalls([parameterName, 1]);
				});

				context('after was calculated once', function () {
					beforeEach(function(){
						invokeComputed(parameters);
					});

					it('should not calculate second time if value dependency was not changed', function () {
						var actualValue = invokeComputed(parameters);
						expect(actualValue).to.equal('Hello, ' + originalValue);
						expectCalls([parameterName, 1]);
					});
					
					context('after value dependency was changed', function () {
						beforeEach(function(){
							observableValue.write('Jack');
						});

						it('should not recalculate immediately', function () {
							expectCalls([parameterName, 1]);
						});

						it('should recalculate when requested', function () {
							var actualValue = invokeComputed(parameters);
							expect(actualValue).to.equal('Hello, Jack');
							expectCalls([parameterName, 2]);
						});

						context('after value dependency was changed back immediatelly', function () {
							beforeEach(function(){
								observableValue.write(originalValue);
							});

							it('should not recalculate when requested', function () {
								var actualValue = invokeComputed(parameters);
								expect(actualValue).to.equal('Hello, ' + originalValue);
								expectCalls([parameterName, 1]);
							});
						});
					});
				});

				context('after value dependency was changed', function () {
					beforeEach(function(){
						observableValue.write('Jack');
					});

					it('should not recalculate immediately', function () {
						expectCalls([]);
					});

					it('should recalculate when requested', function () {
						var actualValue = invokeComputed(parameters);
						expect(actualValue).to.equal('Hello, Jack');
						expectCalls([parameterName, 1]);
					});
					
					context('after was recalculated', function () {
						beforeEach(function(){
							invokeComputed(parameters);
						});

						it('should not calculate second time if value dependency was not changed', function () {
							var actualValue = invokeComputed(parameters);
							expect(actualValue).to.equal('Hello, Jack');
							expectCalls([parameterName, 1]);
						});
						
					});
					
				});
			});
		};

		var describeComputedWithParameter = function(otherParameterName, otherParameterValue, parameterValue, parameterName) {
			context('after was computed ' + withParametersSpecName(otherParameterValue), function () {
				beforeEach(function(){
					computedValue(otherParameterValue);
				});
				
				describeCalledWithParameters(function(expected) {
					expectCalls(_.concat([otherParameterName, 1], expected));
				}, parameterValue, parameterName);
			});
		};
		
		describeCalledWithParameters(expectCalls, undefined, 'anonymous');
		describeCalledWithParameters(expectCalls, 'quickFox', 'quickFox');
		describeComputedWithParameter(undefined, 'anonymous', 'quickFox', 'quickFox');
		describeComputedWithParameter('quickFox', 'quickFox', undefined, 'anonymous');
		describeComputedWithParameter('quickFox', 'quickFox', 'lazyDog', 'lazyDog');
	};
	
	describeUsageSyntax(function(parameters) {
		return computedValue.apply(null, parameters);
	});
	
	describeUsageSyntax(function(parameters) {
		var nestedComputed = computedValue.withArgs.apply(null, parameters);
		
		return nestedComputed();
	});
});
