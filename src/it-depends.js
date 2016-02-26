/*!
* it-depends - v{{ version }}
* https://github.com/gerich-home/it-depends
* Copyright (c) 2016 Sergey Gerasimov; Licensed MSPL
*
* Lightweight dependency tracking library for JavaScript
*/

'use strict';

var nop = function() {};
var trackers = [nop];
var handlers = {};
var nextId = 0;
var nextHandlerId = 0;
var lastWriteVersion = 0;

function notifyCurrentTracker(id, observableValue, currentValue) {
	trackers[trackers.length - 1](id, observableValue, currentValue);
};

var createComputed = function(calculator, args) {
	var currentValue;
	var dependencies;
	var id = ++nextId;
	var lastReadVersion = -1;

	var atLeastOneDependencyChanged = function() {
		for (var dependencyId in dependencies) {
			if (!dependencies.hasOwnProperty(dependencyId))
				continue;

			var dependency = dependencies[dependencyId];

			if (dependency.observableValue() !== dependency.capturedValue) {
				return true;
			}
		}

		return false;
	};

	var self = function() {
		var needRecalc = function() {
			return lastReadVersion !== lastWriteVersion &&
				(!dependencies || atLeastOneDependencyChanged())
		};
		
		if (needRecalc()) {
			dependencies = {};

			trackers.push(function(dependencyId, observableValue, capturedValue) {
				if (dependencies[dependencyId])
					return;

				dependencies[dependencyId] = {
					observableValue: observableValue,
					capturedValue: capturedValue
				};
			});

			try {
				currentValue = calculator.apply(null, args);
			} finally {
				trackers.pop();
			}
			
			lastReadVersion = lastWriteVersion;
		}

		notifyCurrentTracker(id, self, currentValue);

		return currentValue;
	};

	return self;
};

var library = {
	onChange: function(handler) {
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
	value: function(initialValue) {
		var currentValue = initialValue;
		var id = ++nextId;

		var self = function() {
			notifyCurrentTracker(id, self, currentValue);
			return currentValue;
		};

		self.write = function(newValue) {
			if (currentValue !== newValue) {
				var oldValue = currentValue;
				currentValue = newValue;
				lastWriteVersion++;
				
				for (var handlerId in handlers) {
					if (!handlers.hasOwnProperty(handlerId))
						continue;
					
					handlers[handlerId](self, oldValue, newValue);
				}
			}
		};
		
		self.onChange = function(handler) {
			return library.onChange(function(changed, from, to) {
				if(changed === self) {
					handler(changed, from, to);
				}
			});
		};
		
		return self;
	},
	computed: function(calculator) {
		var cache = {};
		var allArguments = [];
		
		var self = function() {
			var computedWithArgs = self.withArgs.apply(null, arguments);
			return computedWithArgs();
		};
		
		self.onChange = function(handler) {
			var computedWithNoArgs = self.withNoArgs();
			var oldValue = computedWithNoArgs();
			
			return library.onChange(function() {
				var newValue = computedWithNoArgs();
				
				if(newValue !== oldValue) {
					handler(computedWithNoArgs, oldValue, newValue, []);
					oldValue = newValue;
				}
			});
		};
		
		self.withNoArgs = function() {
			return self.withArgs();
		};
		
		self.withArgs = function() {
			var key = '';
			var skippingUndefinedValues = true;
			
			for(var i = arguments.length - 1; i >= 0; i--) {
				var arg = arguments[i];
				if(skippingUndefinedValues && arg === undefined) {
					continue;
				}
				
				skippingUndefinedValues = false;
				
				var index = allArguments.indexOf(arg);
			
				if(index === -1) {
					key += allArguments.length + ":";
					allArguments.push(arg);
				} else {
					key += index + ":";
				}
			}
			
			var args = arguments;
			return cache[key] || (cache[key] = createComputed(calculator, args));
		};
		
		return self;
	},
	promiseValue: function(promise, initialValue) {
		var currentValue = library.value(initialValue);

		promise.then(currentValue.write);

		return library.computed(currentValue).withArgs();
	}
};

module.exports = library;
