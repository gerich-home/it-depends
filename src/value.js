'use strict';

var changeNotification = require('./changeNotification');
var tracking = require('./tracking');

module.exports = function(initialValue) {
	var currentValue = initialValue;
	var id = tracking.takeNextObservableId();

	var self = function() {
		tracking.recordUsage(id, self, currentValue);
		return currentValue;
	};

	self.write = function(newValue) {
		if (currentValue === newValue) return;
		
		var oldValue = currentValue;
		currentValue = newValue;
		tracking.lastWriteVersion++;
		
		changeNotification.notify(self, oldValue, newValue);
	};
	
	self.onChange = function(handler) {
		return changeNotification.subscribe(function(changed, from, to) {
			if(changed === self) {
				handler(changed, from, to);
			}
		});
	};
	
	return self;
};
