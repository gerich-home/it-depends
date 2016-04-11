'use strict';

import changeNotification from './changeNotification';
import { valueChanged } from './bulkChange';
import { doChange } from './change';
import * as tracking from './tracking';
import { DependencyValueState } from './tracking';
import { default as subscriptionList, ISubscription, IChangeHandler, ISubscriptions, IHasValue,
    IDependencyState } from './subscriptionList';

export interface IValue<T> extends IHasValue<T> {
    write(value: T): void;
}

export default function<T>(initialValue: T): IValue<T> {
    var currentState: DependencyValueState<T> = new DependencyValueState<T>(initialValue);
    var id = tracking.takeNextObservableId();
    var subscriptions: ISubscriptions<T>;

    var getCurrentState = () => currentState;

    var self = <IValue<T>>function(): T {
        tracking.recordUsage(id, self, getCurrentState);
        return currentState.unwrap();
    };

    var notifySubscribers = function(from: DependencyValueState<T>, to: DependencyValueState<T>): void {
        if (subscriptions) {
            subscriptions.notify(from, to);
        }

        changeNotification.notify(from, to);
    };

    self.write = function(newValue: T): void {
        if (currentState.value === newValue) {
            return;
        }

        var oldState = currentState;
        currentState = new DependencyValueState<T>(newValue);
        tracking.lastWriteVersion++;

        doChange(() => valueChanged(id, getCurrentState, oldState, notifySubscribers));
    };

    self.onChange = function(handler: IChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<T>();

        return subscriptions.subscribe((from: IDependencyState<T>, to: IDependencyState<T>) => {
            type ValueState = DependencyValueState<T>;
            handler(self, (<ValueState>from).value, (<ValueState>to).value);
        });
    };

    return self;
}
