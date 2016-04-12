'use strict';

import { IDependencyState } from './interfaces/IDependencyState';
import { doChange } from './change';

interface IChange<T> {
    getCurrentState: () => IDependencyState<T>;
    notify(newState: IDependencyState<T>): void;
}

interface IHasChanges {
    [id: number]: boolean;
}

var bulkLevels: number = 0;
var changes: IChange<any>[];
var hasChange: IHasChanges;

export function stateChanged<T>(id: number, getCurrentState: () => IDependencyState<T>,
                                notify: (newState: IDependencyState<T>) => void): void {
    if (bulkLevels === 0) {
        notify(getCurrentState());
    } else if (hasChange[id] === undefined) {
        changes.push({
            notify: notify,
            getCurrentState: getCurrentState
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
        bulkLevels--;

        if (isFirstBulk) {
            for (var change of changes) {
                change.notify(change.getCurrentState());
            }

            changes = undefined;
            hasChange = undefined;
        }
    }
}
