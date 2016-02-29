'use strict';

var tracking = require('./tracking');
var changeNotification = require('./changeNotification');

module.exports = function(calculator, args) {
	var currentValue;
	var dependencies;
	var id = tracking.takeNextObservableId();
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
			return lastReadVersion !== tracking.lastWriteVersion &&
				(!dependencies || atLeastOneDependencyChanged())
		};
		
		if (needRecalc()) {
			dependencies = {};

			tracking
				.trackingWith(function(dependencyId, observableValue, capturedValue) {
					if (dependencies[dependencyId])
						return;

					dependencies[dependencyId] = {
						observableValue: observableValue,
						capturedValue: capturedValue
					};
				})
				.execute(function() {
					currentValue = calculator.apply(null, args);
				});
			
			lastReadVersion = tracking.lastWriteVersion;
		}

		tracking.recordUsage(id, self, currentValue);

		return currentValue;
	};
	
	self.onChange = function(handler) {
		var oldValue = self();
		
		return changeNotification.subscribe(function() {
			var newValue = self();
			
			if(newValue !== oldValue) {
				handler(self, oldValue, newValue, args);
				oldValue = newValue;
			}
		});
	};

	return self;
};