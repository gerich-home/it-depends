'use strict';

export type Tracker = (id: number, observableValue: any, currentValue: any) => void;
let activeTracker: Tracker;
let nextObservableId = 0;

export const state = {
    lastWriteVersion: 0
};

export function recordUsage(id: number, observableValue: any, currentValue: any): void {
    if (!activeTracker) { return; }
    activeTracker(id, observableValue, currentValue);
}

export function takeNextObservableId(): number {
    return ++nextObservableId;
}

export function executeWithTracker<T>(action: () => T, tracker?: Tracker): T {
    const currentTracker = activeTracker;
    activeTracker = tracker;

    try {
        return action();
    } finally {
        activeTracker = currentTracker;
    }
}
