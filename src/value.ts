'use strict';

import changeNotification from './changeNotification';
import { valueChanged } from './bulkChange';
import { doChange } from './change';
import * as tracking from './tracking';
import { DependencyValueState } from './tracking';
import { default as subscriptionList, ISubscription, IValueChangeHandler, ISubscriptions, IHasValue,
    IDependencyState, IStateChangeHandler } from './subscriptionList';

export interface IValue<T> extends IHasValue<T> {
    write(value: T): void;
}

export default function<T>(initialValue: T): IValue<T> {
    var currentState: DependencyValueState<T> = new DependencyValueState<T>(initialValue);
    var id = tracking.takeNextObservableId();
    var subscriptions: ISubscriptions<IStateChangeHandler<T>>;

    var getCurrentState = () => currentState;

    var self = <IValue<T>>function(): T {
        tracking.recordUsage(id, self, getCurrentState);
        return currentState.unwrap();
    };

    var notifySubscribers = function(from: IDependencyState<T>, to: IDependencyState<T>): void {
        type ValueState = DependencyValueState<T>;
        if (subscriptions) {
            subscriptions.notify(from, to);
        }

        changeNotification.notify(self, (<ValueState>from).value, (<ValueState>to).value);
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

    self.onChange = function(handler: IValueChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<IStateChangeHandler<T>>();

        return subscriptions.subscribe((from: IDependencyState<T>, to: IDependencyState<T>) => {
            type ValueState = DependencyValueState<T>;
            handler(self, (<ValueState>from).value, (<ValueState>to).value);
        });
    };

    return self;
}
