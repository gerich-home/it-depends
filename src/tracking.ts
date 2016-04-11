'use strict';

import { IHasValue } from './subscriptionList';

export interface IDependencyState<T> {
    value?: T;
    error?: any;
}

export type Tracker<T> = (id: number, observableValue: IHasValue<T>, getState: () => IDependencyState<T>) => void;

var activeTracker: Tracker<any>;
var nextObservableId = 0;

export var lastWriteVersion = 0;

export function recordUsage<T>(id: number, observableValue: IHasValue<T>, getState: () => IDependencyState<T>): void {
    if (!activeTracker) { return; }
    activeTracker(id, observableValue, getState);
}

export function takeNextObservableId(): number {
    return ++nextObservableId;
}

export function executeWithTracker<T>(action: () => T, tracker?: Tracker<T>): T {
    var currentTracker = activeTracker;
    activeTracker = tracker;

    try {
        return action();
    } finally {
        activeTracker = currentTracker;
    }
}
