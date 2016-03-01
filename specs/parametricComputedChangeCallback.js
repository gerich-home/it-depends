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
	
	var expectCalls = function() {
		var expectedCounts = {};
		for(var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			var key = arg[0];
			expect(expectedCounts).to.not.include.keys(key);
			expectedCounts[key] = arg[1];
		}
		
		var expectedKeys = _.keys(expectedCounts);
		var actualKeys = _.keys(calls.counts);
		
		_(expectedKeys)
			.union(actualKeys)
			.forEach(function(key) {
				expect(calls.counts[key] || 0).to.equal(expectedCounts[key] || 0);
			});
	};
	
	beforeEach(function() {
		observableValues = {
			quickFox: itDepends.value('Bob'),
			lazyDog: itDepends.value('James'),
			anonymous: itDepends.value('Incognito')
		};

		computedValue = itDepends.computed(function(userId) {
			if(userId === undefined) {
				userId = 'anonymous';
			}
			
			return 'Hello, ' + observableValues[userId]();
		});
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
				var changeHandler = function(changed, from, to, args) {
					var userId = args[0];
					if(userId === undefined) {
						userId = 'anonymous';
					}
					
					callsSpy.counts[userId] = (callsSpy.counts[userId] || 0) + 1;
					callsSpy.lastChange = { changed: changed, from: from, to: to, args: args };
				};
				
				subscription = computedValueWithArgs.onChange(changeHandler);
				otherSubscription = computedValue.withArgs('lazyDog').onChange(changeHandler);
			});
			
			afterEach(function(){
				subscription.disable();
				otherSubscription.disable();
			});
			
			it('should not be triggered when new subscription is created', function () {
				expectCalls();
			});

			it('should not be triggered when observable is not changed', function () {
				observableValue.write(originalValue);
				expectCalls();
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
	
			context('when disabled', function() {
				beforeEach(function() {
					subscription.disable();
				});
			
				it('should not be triggered when observable is changed', function () {
					observableValue.write('Jack');
					
					expectCalls();
				});

				context('when enabled back', function() {
					beforeEach(function() {
						subscription.enable();
					});
				
					it('should be triggered when observable is changed', function () {
						observableValue.write('Jack');
						
						expectCalls([parameterName, 1]);
						expectLastChanges({ changed: computedValueWithArgs, from: 'Hello, ' + originalValue, to: 'Hello, Jack', args: parameters });
					});
				});
			});
			
			context('when other observable is changed', function() {
				beforeEach(function() {
					observableValues.lazyDog.write('Jack');
				});

				it('should not be triggered', function () {
					expectCalls(['lazyDog', 1]);
				});
			});
		});
	};
	
	describeCalledWithParameters(undefined, 'anonymous');
	describeCalledWithParameters('quickFox', 'quickFox');
});
