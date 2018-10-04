'use strict';

import { valueChanged } from './bulkChange';
import { doChange } from './change';
import changeNotification from './changeNotification';
import { default as subscriptionList, IChangeHandler, IHasValue, ISubscription, ISubscriptions } from './subscriptionList';
import * as tracking from './tracking';

export interface IValue<T> extends IHasValue<T> {
    write(value: T): void;
}

export default function<T>(initialValue: T): IValue<T> {
    const id = tracking.takeNextObservableId();

    let currentValue = initialValue;
    let subscriptions: ISubscriptions<T>;

    const self = <IValue<T>>read;

    self.write = write;
    self.onChange = onChange;

    return self;

    function read(): T {
        tracking.recordUsage(id, self, currentValue);
        return currentValue;
    }

    function write(newValue: T): void {
        if (currentValue === newValue) {
            return;
        }

        const oldValue = currentValue;
        currentValue = newValue;
        tracking.state.lastWriteVersion++;

        doChange(() => {
            valueChanged(id, self, oldValue, notifySubscribers);
        });
    }

    function onChange(handler: IChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<T>();

        return subscriptions.subscribe(handler);
    }

    function notifySubscribers(from: T, to: T): void {
        if (subscriptions) {
            subscriptions.notify(self, from, to);
        }

        changeNotification.notify(self, from, to);
    }
}
