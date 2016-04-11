'use strict';

import changeNotification from './changeNotification';
import { valueChanged } from './bulkChange';
import { doChange } from './change';
import * as tracking from './tracking';
import { IDependencyState } from './tracking';
import { default as subscriptionList, ISubscription, IChangeHandler, ISubscriptions, IHasValue } from './subscriptionList';

export interface IValue<T> extends IHasValue<T> {
    write(value: T): void;
}

export default function<T>(initialValue: T): IValue<T> {
    var currentState: IDependencyState<T> = {
        value: initialValue
    };
    var id = tracking.takeNextObservableId();
    var subscriptions: ISubscriptions<T>;

    var self = <IValue<T>>function(): T {
        tracking.recordUsage(id, self, () => currentState);
        return currentState.value;
    };

    var notifySubscribers = function(from: T, to: T): void {
        if (subscriptions) {
            subscriptions.notify(self, from, to);
        }

        changeNotification.notify(self, from, to);
    };

    self.write = function(newValue: T): void {
        if (currentState.value === newValue) {
            return;
        }

        var oldState = currentState;
        currentState = {
            value: newValue
        };
        tracking.lastWriteVersion++;

        doChange(() => {
            valueChanged(id, self, oldState.value, notifySubscribers);
        });
    };

    self.onChange = function(handler: IChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<T>();

        return subscriptions.subscribe(handler);
    };

    return self;
}
