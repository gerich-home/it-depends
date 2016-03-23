'use strict';

import changeNotification from './changeNotification';
import * as tracking from './tracking';
import { default as subscriptionList, ISubscription, IChangeHandler, ISubscriptions, IHasValue } from './subscriptionList';

export interface IValue<T> extends IHasValue<T> {
    write(value: T): void;
}

export default function<T>(initialValue: T): IValue<T> {
    var currentValue = initialValue;
    var id = tracking.takeNextObservableId();
    var subscriptions: ISubscriptions<T>;

    var self = <IValue<T>>function(): T {
        tracking.recordUsage(id, self, currentValue);
        return currentValue;
    };

    self.write = function(newValue: T): void {
        if (currentValue === newValue) {
            return;
        }

        var oldValue = currentValue;
        currentValue = newValue;
        tracking.lastWriteVersion++;

        if (subscriptions) {
            subscriptions.notify(self, oldValue, newValue);
        }

        changeNotification.notify(self, oldValue, newValue);
    };

    self.onChange = function(handler: IChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<T>();

        return subscriptions.subscribe(handler);
    };

    return self;
}
