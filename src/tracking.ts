'use strict';

export type Tracker = (id: number, observableValue: any, currentValue: any) => void;
var nop: Tracker = function() {};
var trackers: Tracker[] = [nop];
var nextObservableId = 0;

export var lastWriteVersion = 0;

export function recordUsage(id: number, observableValue: any, currentValue: any) {
	trackers[trackers.length - 1](id, observableValue, currentValue);
}

export function takeNextObservableId() {
	return ++nextObservableId;
}

export function trackingWith(tracker: Tracker) {
	return {
		execute: function(action: () => void) {
			trackers.push(tracker);
			
			try {
				action();
			} finally {
				trackers.pop();
			}
		}
	};
}