'use strict';

import { IHasValue } from './subscriptionList';

interface IChange<T> {
    value: IHasValue<T>;
    notify(): void;
}

interface IChanges {
    [id: number]: IChange<any>;
    ids: number[];
}

var bulkLevels: number = 0;
var changes: IChanges;

export function valueChanged<T>(id: number, value: IHasValue<T>, oldValue: T, notify: (from: T, to: T) => void): void {
    if (bulkLevels === 0) {
        notify(oldValue, value());
    } else if (!changes[id]) {
        changes.ids.push(id);

        changes[id] = {
            notify: function(): void {
                var newValue = value();
                if (oldValue !== newValue) {
                    notify(oldValue, newValue);
                }
            },
            value: value
        };
    }
}

export default function(changeAction: () => void): void {
    var isFirstBulk = bulkLevels === 0;
    if (isFirstBulk) {
        changes = {
            ids: []
        };
    }

    bulkLevels++;

    try {
        changeAction();
    } finally {
        if (isFirstBulk) {
            for (var id of changes.ids) {
                changes[id].value();
            }
        }

        bulkLevels--;

        if (isFirstBulk) {
            for (var id of changes.ids) {
                changes[id].notify();
            }

            changes = undefined;
        }
    }
}
