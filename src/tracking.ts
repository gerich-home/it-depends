'use strict';

import { IHasValue, IDependencyState } from './subscriptionList';

export class DependencyValueState<T> implements IDependencyState<T> {
    constructor(public value: T) {}

    public equals(other: IDependencyState<T>): boolean {
        return other instanceof DependencyValueState && other.value === this.value;
    };

    public unwrap(): T {
        return this.value;
    }
}

export class DependencyErrorState implements IDependencyState<any> {
    constructor(private error: any) {}

    public equals(other: IDependencyState<any>): boolean {
        return other instanceof DependencyErrorState && other.error === this.error;
    };

    public unwrap(): any {
        throw this.error;
    }
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
