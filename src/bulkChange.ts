'use strict';

import { IDependencyState } from './subscriptionList';
import { doChange } from './change';

interface IChange<T> {
    getCurrentState: () => IDependencyState<T>;
    oldState: IDependencyState<T>;
    newState?: IDependencyState<T>;
    notify(from: T, to: T): void;
}

interface IHasChanges {
    [id: number]: boolean;
}

var bulkLevels: number = 0;
var changes: IChange<any>[];
var hasChange: IHasChanges;

export function valueChanged<T>(id: number, getCurrentState: () => IDependencyState<T>, oldState: IDependencyState<T>,
                                notify: (from: IDependencyState<T>, to: IDependencyState<T>) => void): void {
    if (bulkLevels === 0) {
        notify(oldState, getCurrentState());
    } else if (hasChange[id] === undefined) {
        changes.push({
            notify: notify,
            getCurrentState: getCurrentState,
            oldState: oldState
        });

        hasChange[id] = true;
    }
}

export default function(changeAction: () => void): void {
    var isFirstBulk = bulkLevels === 0;

    if (isFirstBulk) {
        changes = [];
        hasChange = {};
    }

    bulkLevels++;

    try {
        doChange(changeAction);
    } finally {
        if (isFirstBulk) {
            for (var change of changes) {
                change.newState = change.getCurrentState();
            }
        }

        bulkLevels--;

        if (isFirstBulk) {
            for (var change of changes) {
                if (!change.oldState.equals(change.newState)) {
                    change.notify(change.oldState, change.newState);
                }
            }

            changes = undefined;
            hasChange = undefined;
        }
    }
}
