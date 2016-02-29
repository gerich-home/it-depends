'use strict';

var tracking = require('./tracking');
var value = require('./value');
var computed = require('./computed');

module.exports = function(promise, initialValue) {
	var currentValue = value(initialValue);

	promise.then(currentValue.write);

	return computed(currentValue, []);
};
