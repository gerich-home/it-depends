'use strict';

var handlers = {};
var nextHandlerId = 0;

module.exports = {
	subscribe: function(handler) {
		var handlerId = ++nextHandlerId;
		
		var subscription = {
			enable: function() {
				handlers[handlerId] = handler;
			},
			disable: function() {
				delete handlers[handlerId];
			}
		};
		
		subscription.enable();
		
		return subscription;
	},
	notify: function(value, from, to) {
		for (var handlerId in handlers) {
			if (!handlers.hasOwnProperty(handlerId))
				continue;
			
			handlers[handlerId](value, from, to);
		}
	}
};
