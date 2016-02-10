var expect = require('chai').expect;
var itDepends = require('../src/it-depends.js').itDepends;

describe('promise value', function () {
	var callbacks = [];
	var promiseValue;
	var initialValue = 'Hello';
	
	var resolvePromise = function(newValue) {
		for(var i = 0; i < callbacks.length; i++) {
			callbacks[i](newValue);
		}
	};

	beforeEach(function(){
		var promise = {
			then: function(callback) {
				callbacks.push(callback);
			}
		};
		
		promiseValue = itDepends.promiseValue(promise, initialValue);
	});

	it('should be initialized with given value', function () {
		expect(promiseValue()).to.equal(initialValue);
	});

	it('should be changed to new value after promise was resolved', function () {
		resolvePromise('Bye');
		expect(promiseValue()).to.equal('Bye');
	});
});
