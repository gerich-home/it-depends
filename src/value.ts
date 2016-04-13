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
import { IStateChangeHandler } from './interfaces/IStateChangeHandler';
import { IValueChangeHandler } from './interfaces/IValueChangeHandler';

export default function<T>(initialValue: T): ITrackableWritableValue<T> {
    var currentState: DependencyValueState<T> = new DependencyValueState<T>(initialValue);
    var id = tracking.takeNextObservableId();
    var subscriptions: ISubscriptions<IStateChangeHandler<DependencyValueState<T>>>;
    var oldState: DependencyValueState<T>;

    var getCurrentState = () => currentState;

    var self = <ITrackableWritableValue<T>>function(): T {
        tracking.recordUsage(id, self, getCurrentState);
        return currentState.unwrap();
    };

    var notifySubscribers = function(newState: DependencyValueState<T>): void {
        if (subscriptions) {
            subscriptions.notify(newState);
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
        subscriptions = subscriptions || subscriptionList<IStateChangeHandler<DependencyValueState<T>>>();

        var capturedState = currentState;
        return subscriptions.subscribe((newState: DependencyValueState<T>) => {
            if (capturedState.value !== newState.value) {
                handler(self, capturedState.value, newState.value);
            }

            capturedState = newState;
        });
    };

    return self;
}
