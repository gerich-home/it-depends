'use strict';

import { doChange } from './change';
import { IHasValue } from './subscriptionList';

interface IChange<T> {
    value: IHasValue<T>;
    oldValue: T;
    newValue?: T;
    notify(from: T, to: T): void;
}

interface IHasChanges {
    [id: number]: boolean;
}

let bulkLevels: number = 0;
let changes: IChange<any>[];
let hasChange: IHasChanges;

export function valueChanged<T>(id: number, value: IHasValue<T>, oldValue: T, notify: (from: T, to: T) => void): void {
    if (bulkLevels === 0) {
        notify(oldValue, value());
    } else if (hasChange[id] === undefined) {
        changes.push({
            notify: notify,
            value: value,
            oldValue: oldValue
        });

        hasChange[id] = true;
    }
}

export default function(changeAction: () => void): void {
    const isFirstBulk = bulkLevels === 0;

    if (isFirstBulk) {
        changes = [];
        hasChange = {};
    }

    bulkLevels++;

    try {
        doChange(changeAction);
    } finally {
        if (isFirstBulk) {
            for (const change of changes) {
                change.newValue = change.value();
            }
        }

        bulkLevels--;

        if (isFirstBulk) {
            for (const change of changes) {
                if (change.oldValue !== change.newValue) {
                    change.notify(change.oldValue, change.newValue);
                }
            }

            changes = undefined;
            hasChange = undefined;
        }
    }
}
