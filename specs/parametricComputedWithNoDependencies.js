var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js');
var _ = require('lodash');

describe('parametric computed with no dependencies', function () {
	var callCounts;
	var computedValue;
	
	var stringify = function(values) {
		return JSON.stringify(values, function(key, value) {
		  if (typeof value === 'undefined') {
			return "UNDEFINED";
		  }
		  
		  return value;
		});
	};
	
	var objA = {};
	var objB = {};
	
	var exampleValues = [
		[],
		['a'],
		['b'],
		['a', 'b'],
		[''],
		[1],
		[1, undefined],
		[1, 'test'],
		[3],
		[0],
		[objB],
		[objA],
		[objA, objB],
		[true],
		[false],
		[undefined],
		[null]
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
		var args = Array.prototype.slice.call(arguments);
		
		var expectedCounts = {};
		for(var i = 0; i < args.length; i++) {
			var key = makeKey(args[i][0]);
			expect(expectedCounts).to.not.include.keys(key);
			expectedCounts[key] = args[i][1];
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
			var result = makeKey(Array.prototype.slice.call(arguments));
			callCounts[result] = callCounts[result] ? callCounts[result] + 1 : 1;
			
			return result;
		});
	});

	it('should not calculate when created', function () {
		expectCounts();
	});

	var defineTest = function(i) {
		var values = exampleValues[i];
		var valuesString = stringify(values);
		
		it('should calculate when requested with values ' + valuesString, function () {
			var actualValue = computedValue.apply(null, values);
			
			expect(actualValue).to.equal(makeKey(values));
			expectCounts([values, 1]);
		});
		
		context('after was calculated once with values ' + valuesString, function () {
			var j = (i + 1) % exampleValues.length;
			var otherValues = exampleValues[j];
			var otherValuesString = stringify(otherValues);
			
			beforeEach(function() {
				computedValue.apply(null, values);
			});

			it('should not calculate second time', function () {
				var actualValue = computedValue.apply(null, values);
				
				expect(actualValue).to.equal(makeKey(values));
				expectCounts([values, 1]);
			});

			it('should calculate with values ' + otherValuesString, function () {
				var actualValue = computedValue.apply(null, otherValues);
				
				expect(actualValue).to.equal(makeKey(otherValues));
				expectCounts([values, 1], [otherValues, 1]);
			});
			
			context('after was calculated once with values ' + otherValuesString, function () {
				beforeEach(function() {
					computedValue.apply(null, otherValues);
				});

				it('should not calculate second time with values ' + valuesString, function () {
					var actualValue = computedValue.apply(null, values);
					
					expect(actualValue).to.equal(makeKey(values));
					expectCounts([values, 1], [otherValues, 1]);
				});

				it('should not calculate second time with values ' + otherValuesString, function () {
					var actualValue = computedValue.apply(null, otherValues);
					
					expect(actualValue).to.equal(makeKey(otherValues));
					expectCounts([values, 1], [otherValues, 1]);
				});
			});
		});
	};
	
	for(var i = 0; i < exampleValues.length; i++) {
		defineTest(i);
	}
});
