'use strict';

var nop = function() {};
var trackers = [nop];
var nextObservableId = 0;

module.exports = {
	lastWriteVersion: 0,
	recordUsage: function(id, observableValue, currentValue) {
		trackers[trackers.length - 1](id, observableValue, currentValue);
	},
	takeNextObservableId: function() {
		return ++nextObservableId;
	},
	trackingWith: function(tracker) {
		return {
			execute: function(action) {
				trackers.push(tracker);
				
				try {
					action();
				} finally {
					trackers.pop();
				}
			}
		};
	}
};
