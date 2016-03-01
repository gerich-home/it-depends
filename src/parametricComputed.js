'use strict';

var computed = require('./computed');

module.exports = function(calculator) {
	var cache = {};
	var allArguments = [];
	
	var self = function() {
		var computedWithArgs = self.withArgs.apply(null, arguments);
		return computedWithArgs();
	};
	
	self.onChange = function(handler) {
		return self.withNoArgs().onChange(handler);
	};
	
	self.withNoArgs = function() {
		return self.withArgs();
	};
	
	self.withArgs = function() {
		var key = '';
		var skippingUndefinedValues = true;
		var argsToDrop = 0;
		
		for(var i = arguments.length - 1; i >= 0; i--) {
			var arg = arguments[i];
			if(skippingUndefinedValues) {
				if(arg === undefined) {
					argsToDrop++
					continue;
				}
				
				skippingUndefinedValues = false;
			}
			
			var index = allArguments.indexOf(arg);
		
			if(index === -1) {
				key += allArguments.length + ":";
				allArguments.push(arg);
			} else {
				key += index + ":";
			}
		}
		
		var args = Array.prototype.slice.call(arguments, 0, arguments.length - argsToDrop);
		return cache[key] || (cache[key] = computed(calculator, args));
	};
	
	return self;
};