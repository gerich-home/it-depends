'use strict';

export type Tracker = (id: number, observableValue: any, currentValue: any) => void;
var activeTracker: Tracker;
var trackers: Tracker[] = [];
var nextObservableId = 0;

export var lastWriteVersion = 0;

export function recordUsage(id: number, observableValue: any, currentValue: any): void {
    if (!activeTracker) { return; }
    activeTracker(id, observableValue, currentValue);
}

export function takeNextObservableId(): number {
    return ++nextObservableId;
}

export interface ITrackerExecution {
    execute(action: () => void): void;
}

export function trackingWith(tracker: Tracker): ITrackerExecution {
    return {
        execute: function(action: () => void): void {
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
