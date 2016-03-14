'use strict';

export type Tracker = (id: number, observableValue: any, currentValue: any) => void;
var activeTracker: Tracker;
var trackers: Tracker[] = [];
var nextObservableId = 0;

export var lastWriteVersion = 0;

export function recordUsage(id: number, observableValue: any, currentValue: any) {
	if(!activeTracker) { return; }
	activeTracker(id, observableValue, currentValue);
}

export function takeNextObservableId() {
	return ++nextObservableId;
}

export function trackingWith(tracker: Tracker) {
	return {
		execute: function(action: () => void) {
			trackers.push(activeTracker);
			activeTracker = tracker;
			
			try {
				action();
			} finally {
				activeTracker = trackers.pop();
			}
		}
	};
}