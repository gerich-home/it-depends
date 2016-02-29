'use strict';

var changeNotification = require('./changeNotification');
var value = require('./value');
var parametricComputed = require('./parametricComputed');
var promiseValue = require('./promiseValue');

module.exports = {
	onChange: changeNotification.subscribe,
	value: value,
	computed: parametricComputed,
	promiseValue: promiseValue
};
