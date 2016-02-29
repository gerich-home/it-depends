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
		var expectedCount = _(expected.args)
			.dropRightWhile(function(x) {
				return x === undefined;
			})
			.size();
			
		expect(calls.lastChange.args.length).to.equal(expectedCount);
		
		for(var i = 0; i < expectedCount; i++) {
			expect(calls.lastChange.args[i]).to.equal(expected.args[i]);
		}
	};
	
	var expectCalls = function(expectedCountPairs) {
		var expectedCounts = _.zipObject(expectedCountPairs);
		var expectedKeys = _.keys(expectedCounts);
		var actualKeys = _.keys(calls.counts);
		
		for(var key in _.union(expectedKeys, actualKeys)) {
			expect(calls.counts[key] || 0).to.equal(expectedCounts[key] || 0);
		}
	};
	
	beforeEach(function() {
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
	
	var describeCalledWithParameters = function(parameterValue, parameterName) {
		var parameters = [parameterValue];
		var observableValue;
		var originalValue;
		var computedValueWithArgs;
		
		context(withParametersSpecName(parameterValue), function () {
			beforeEach(function(){
				observableValue = observableValues[parameterName];
				originalValue = observableValue();
				computedValueWithArgs = computedValue.withArgs.apply(null, parameters);
				
				var callsSpy = {
					counts: {}
				};
				calls = callsSpy;
				
				subscription = computedValueWithArgs.onChange(function(changed, from, to, args) {
					var userId = args[0];
					if(userId === undefined) {
						userId = 'anonymous';
					}
					
					callsSpy.counts[userId] = (callsSpy.counts[userId] || 0) + 1;
					callsSpy.lastChange = { changed: changed, from: from, to: to, args: args };
				});
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
					expectLastChanges({ changed: computedValueWithArgs, from: 'Hello, ' + originalValue, to: 'Hello, Jack', args: parameters });
				});

				it('should be triggered again when changed back', function () {
					observableValue.write(originalValue);
					expectCalls([parameterName, 2]);
					expectLastChanges({ changed: computedValueWithArgs, from: 'Hello, Jack', to: 'Hello, ' + originalValue, args: parameters });
				});
			});
			
			context('when other observable is changed', function() {
				beforeEach(function() {
					observableValues.lazyDog.write('Jack');
				});

				it('should be triggered once', function () {
					expectCalls();
				});
			});
		});
	};
	
	describeCalledWithParameters(undefined, 'anonymous');
	describeCalledWithParameters('quickFox', 'quickFox');
});
