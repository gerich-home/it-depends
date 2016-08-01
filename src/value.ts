'use strict';

import changeNotification from './changeNotification';
import { stateChanged } from './bulkChange';
import { doChange } from './change';
import * as tracking from './tracking';
import DependencyValueState from './DependencyValueState';
import subscriptionList from './subscriptionList';
import { ITrackableWritableValue } from './interfaces/ITrackableWritableValue';
import { ISubscription } from './interfaces/ISubscription';
import { ISubscriptions } from './interfaces/ISubscriptions';
import { IValueChangeHandler } from './interfaces/IValueChangeHandler';

export default function<T>(initialValue: T): ITrackableWritableValue<T> {
    interface IChangeHandler {
        (to: T): void;
    }

    var currentState: DependencyValueState<T> = new DependencyValueState<T>(initialValue);
    var id = tracking.takeNextObservableId();
    var subscriptions: ISubscriptions<IChangeHandler>;
    var oldState: DependencyValueState<T>;

    var getCurrentState = () => currentState;

    var self = <ITrackableWritableValue<T>>function(): T {
        tracking.recordUsage(id, self, getCurrentState);
        return currentState.unwrap();
    };

    var notifySubscribers = function(newState: DependencyValueState<T>): void {
        if (subscriptions) {
            subscriptions.forEach(h => h(newState.value));
        }

        if (oldState.value !== newState.value) {
            changeNotification.notify(self, oldState.value, newState.value);
        }

        oldState = undefined;
    };

    self.write = function(newValue: T): void {
        if (currentState.value === newValue) {
            return;
        }

        if (oldState === undefined) {
            oldState = currentState;
        }

        currentState = new DependencyValueState<T>(newValue);
        tracking.lastWriteVersion++;

        doChange(() => stateChanged(id, getCurrentState, notifySubscribers));
    };

    self.onChange = function(handler: IValueChangeHandler<T, ITrackableWritableValue<T>>): ISubscription {
        subscriptions = subscriptions || subscriptionList<IChangeHandler>();

        var capturedValue = currentState.value;

        return subscriptions.subscribe((changed: ITrackableWritableValue<T>, from: T, to: T) => {
            if (capturedValue !== to) {
                handler(self, capturedValue, to);
            }

            capturedValue = to;
        });
    };

    return self;
}
