var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');
var _ = require('lodash');

describe('parametric computed with no dependencies', function () {
	var callCounts;
	var computedValue;
	
	var stringify = function(values) {
		return JSON.stringify(values, function(key, value) {
		  if (typeof value === 'undefined') {
			return 'undefined';
		  }
		  
		  return value;
		});
	};
	
	var objA = {};
	var objB = {};
	
	var exampleValues = [
		[],
		[null],
		[true],
		[false],
		['a'],
		['b'],
		['a', 'b'],
		[''],
		[1],
		[1, 'test'],
		[1, 1],
		[1, 2],
		[1, undefined, 1],
		[1, 1, 1],
		[3],
		[0],
		[objB],
		[objA],
		[objA, objB]
	];
	
	var valuesIndex = _(exampleValues)
		.flatten()
		.uniq()
		.value();
		
	var makeKey = function(values) {
		return _(values)
			.map(function(value) {
				return valuesIndex.indexOf(value);
			})
			.value()
			.join(':');
	};
	
	var expectCounts = function() {
		var expectedCounts = {};
		for(var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			var key = makeKey(arg[0]);
			expect(expectedCounts).to.not.include.keys(key);
			expectedCounts[key] = arg[1];
		}
		
		for(var key in expectedCounts) {
			if(expectedCounts.hasOwnProperty(key)) {
				expect(callCounts[key]).to.equal(expectedCounts[key]);
			}
		}
		
		for(var key in callCounts) {
			if(callCounts.hasOwnProperty(key)) {
				expect(expectedCounts).to.include.keys(key);
			}
		}
	};

	beforeEach(function() {
		callCounts = {};

		computedValue = itDepends.computed(function() {
			var result = makeKey(arguments);
			callCounts[result] = (callCounts[result] || 0) + 1;
			
			return result;
		});
	});
	
	it('should not calculate when created', function () {
		expectCounts();
	});

	var describeUsageSyntax = function(invokeComputed) {
		var defineTest = function(i) {
			var values = exampleValues[i];
			var valuesString = stringify(values);
			
			it('should calculate when requested with values ' + valuesString, function () {
				var actualValue = invokeComputed(values);
				
				expect(actualValue).to.equal(makeKey(values));
				expectCounts([values, 1]);
			});
			
			context('after was calculated once with values ' + valuesString, function () {
				var j = (i + 1) % exampleValues.length;
				var otherValues = exampleValues[j];
				var otherValuesString = stringify(otherValues);
				
				beforeEach(function() {
					invokeComputed(values);
				});

				it('should not calculate second time', function () {
					var actualValue = invokeComputed(values);
					
					expect(actualValue).to.equal(makeKey(values));
					expectCounts([values, 1]);
				});

				it('should calculate with values ' + otherValuesString, function () {
					var actualValue = invokeComputed(otherValues);
					
					expect(actualValue).to.equal(makeKey(otherValues));
					expectCounts([values, 1], [otherValues, 1]);
				});

				it('should not calculate when passing trailing undefined values', function () {
					var extendedValues = _(values).concat([undefined, undefined]).value();
					var actualValue = invokeComputed(extendedValues);
					
					expect(actualValue).to.equal(makeKey(values));
					expectCounts([values, 1]);
				});
				
				context('after was calculated once with values ' + otherValuesString, function () {
					beforeEach(function() {
						invokeComputed(otherValues);
					});

					it('should not calculate second time with values ' + valuesString, function () {
						var actualValue = invokeComputed(values);
						
						expect(actualValue).to.equal(makeKey(values));
						expectCounts([values, 1], [otherValues, 1]);
					});

					it('should not calculate second time with values ' + otherValuesString, function () {
						var actualValue = invokeComputed(otherValues);
						
						expect(actualValue).to.equal(makeKey(otherValues));
						expectCounts([values, 1], [otherValues, 1]);
					});
				});
			});
		};
		
		for(var i = 0; i < exampleValues.length; i++) {
			defineTest(i);
		}
	};
	
	describeUsageSyntax(function(parameters) {
		return computedValue.apply(null, parameters);
	});
});
