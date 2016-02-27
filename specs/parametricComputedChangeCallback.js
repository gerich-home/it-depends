var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');
var _ = require('lodash');

describe('parameteric computed change callback', function () {
	var calls;
	var observableValues;
	var computedValue;
	var subscription;

	var expectLastChanges = function(expected) {
		expect(calls.lastChange.changed).to.equal(expected.changed);
		expect(calls.lastChange.from).to.equal(expected.from);
		expect(calls.lastChange.to).to.equal(expected.to);
		expect(calls.lastChange.args.length).to.equal(expected.args.length);
		
		for(var i = 0; i < calls.lastChange.args.length; i++) {
			expect(calls.lastChange.args[i]).to.equal(expected.args[i]);
		}
	};
	
	var expectCalls = function(expectedCountPairs) {
		var expectedCounts = _.zipObject(expectedCountPairs);
		var expectedKeys = _.keys(expectedCounts);
		var actualKeys = _.keys(calls);
		
		for(var key in _.union(expectedKeys, actualKeys)) {
			expect(calls[key] || 0).to.equal(expectedCounts[key] || 0);
		}
	};
	
	beforeEach(function() {
		var counter = {};
		calls = counter;

		observableValues = {
			quickFox: itDepends.value('Bob'),
			lazyDog: itDepends.value('James'),
			anonymous: itDepends.value('Incognito'),
		};

		computedValue = itDepends.computed(function(userId) {
			if(userId === undefined) {
				userId = 'anonymous';
			}
			
			return 'Hello, ' + observableValues[userId]();
		});
		
		subscription = computedValue.onChange(function(changed, from, to, args) {
			var userId = args[0];
			if(userId === undefined) {
				userId = 'anonymous';
			}
			
			counter[userId] = (counter[userId] || 0) + 1;
		});
	});
	
	afterEach(function() {
		subscription.disable();
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
			
				it('should not be triggered when new subscription is created', function () {
					expectCalls([]);
				});

				it('should not be triggered when observable is not changed', function () {
					observableValue.write(originalValue);
					expectCalls([]);
				});
				
				context('when observable is changed', function() {
					beforeEach(function() {
						observableValue.write('Jack');
					});

					it('should be triggered once', function () {
						expectCalls([parameterName, 1]);
						expectLastChanges({ changed: computedValue.withNoArgs(), from: 'Hello, ' + originalValue, to: 'Hello, Jack', args: [] });
					});

					it('should be triggered once when changed back', function () {
						observableValue.write(originalValue);
						expectCalls([parameterName, 2]);
						expectLastChanges({ changed: computedValue.withNoArgs(), from: 'Hello, Jack', to: 'Hello, Bob', args: [] });
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
