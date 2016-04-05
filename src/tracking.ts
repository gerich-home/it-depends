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
    execute<T>(action: () => T): T;
}

export function trackingWith(tracker: Tracker): ITrackerExecution {
    return {
        execute: function<T>(action: () => T): T {
            trackers.push(activeTracker);
            activeTracker = tracker;

            try {
                return action();
            } finally {
                activeTracker = trackers.pop();
            }
        }
    };
}
