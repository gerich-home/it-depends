'use strict';

import * as tracking from './tracking';
import DependencyValueState from './DependencyValueState';
import DependencyErrorState from './DependencyErrorState';
import subscriptionList from './subscriptionList';
import { IDependencyState } from './interfaces/IDependencyState';
import { ITrackableComputedValue } from './interfaces/ITrackableComputedValue';
import { ITrackableWritableComputedValue } from './interfaces/ITrackableWritableComputedValue';
import { IComputedValue } from './interfaces/IComputedValue';
import { ITrackableValue } from './interfaces/ITrackableValue';
import { ISubscription } from './interfaces/ISubscription';
import { ISubscriptions } from './interfaces/ISubscriptions';
import { IStateChangeHandler } from './interfaces/IStateChangeHandler';
import { IComputedValueChangeHandler } from './interfaces/IComputedValueChangeHandler';
import { ICalculator } from './interfaces/ICalculator';
import { IWriteCallback } from './interfaces/IWriteCallback';
import { stateChanged } from './bulkChange';
import { onChangeFinished } from './change';

var getValueState = function<T>(state: IDependencyState<T>): DependencyValueState<T> {
    return state instanceof DependencyValueState ? state : undefined;
};

export default function<T>(calculator: ICalculator<T>, args: any[]): ITrackableComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, args: any[], writeCallback: IWriteCallback<T>): ITrackableWritableComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, args: any[], writeCallback?: IWriteCallback<T>): IComputedValue<T> {
    var currentState: IDependencyState<T>;

    interface IDependency {
        dependencyId: number;
        getState: () => IDependencyState<any>;
        capturedState: IDependencyState<any>;
        observableValue: ITrackableValue<any>;
        subscription?: ISubscription;
    }

    var dependencies: IDependency[];
    var id = tracking.takeNextObservableId();
    var lastReadVersion;
    var subscriptions: ISubscriptions<IStateChangeHandler<T>>;
    var subscriptionsActive: boolean;
    var self: ITrackableComputedValue<T>;

    var atLeastOneDependencyChanged = function(): boolean {
        return tracking.executeWithTracker(() => {
            for (var dependency of dependencies) {
                if (!dependency.getState().equals(dependency.capturedState)) {
                    return true;
                }
            }

            return false;
        });
    };

    var getCurrentState: () => IDependencyState<T>;

    var updateState = function(): void {
        if (lastReadVersion === tracking.lastWriteVersion) {
            return;
        }

        lastReadVersion = tracking.lastWriteVersion;

        if (dependencies && !atLeastOneDependencyChanged())  {
            return;
        }

        interface IDependencyHash {
            [id: number]: IDependency;
        }

        var dependenciesById: IDependencyHash = {};

        var oldDependencies = dependencies;
        dependencies = [];

        var tracker = function(dependencyId: number, observableValue: ITrackableValue<any>, getState: () => IDependencyState<any>): void {
            if (dependenciesById[dependencyId] !== undefined) {
                return;
            }

            var dependency = {
                dependencyId: dependencyId,
                observableValue: observableValue,
                getState: getState,
                capturedState: getState()
            };

            dependenciesById[dependencyId] = dependency;
            dependencies.push(dependency);
        };

        try {
            currentState = new DependencyValueState(tracking.executeWithTracker(() => calculator.apply(undefined, args), tracker));
        } catch (e) {
            currentState = new DependencyErrorState(e);
        }

        if (subscriptionsActive) {
            if (oldDependencies) {
                for (var oldDependency of oldDependencies) {
                    var newDependency = dependenciesById[oldDependency.dependencyId];

                    if (newDependency !== undefined) {
                        newDependency.subscription = oldDependency.subscription;
                    }
                }
            }

            for (var dependency of dependencies) {
                dependency.subscription = dependency.subscription || dependency.observableValue.onChange(updateState);
            }

            if (oldDependencies) {
                onChangeFinished(() => {
                    for (var oldDependency of oldDependencies) {
                        var newDependency = dependenciesById[oldDependency.dependencyId];

                        if (newDependency === undefined) {
                            oldDependency.subscription.disable();
                        }
                    }
                });
            }

            stateChanged(id, getCurrentState, subscriptions.notify);
        }
    };

    getCurrentState = function(): IDependencyState<T> {
        updateState();

        return currentState;
    };

    var unsubscribeDependencies = function(): void {
        for (var dependency of dependencies) {
            dependency.subscription.disable();
            dependency.subscription = undefined;
        }
    };

    var subscribeDependencies = function(): void {
        for (var dependency of dependencies) {
            dependency.subscription = dependency.observableValue.onChange(updateState);
        }
    };

    self = <IComputedValue<T>>function(): T {
        updateState();

        tracking.recordUsage(id, self, getCurrentState);

        return currentState.unwrap();
    };

    self.onChange = function(handler: IComputedValueChangeHandler<T, ITrackableComputedValue<T>>): ISubscription {
        subscriptions = subscriptions || subscriptionList<IStateChangeHandler<T>>({
            activated: function(): void {
                if (dependencies) {
                    subscribeDependencies();
                }

                subscriptionsActive = true;
            },
            deactivated: function(): void {
                if (dependencies) {
                    unsubscribeDependencies();
                }

                subscriptionsActive = false;
            }
        });

        var capturedState = getValueState(getCurrentState());
        return subscriptions.subscribe((newState: IDependencyState<T>) => {
            if (newState instanceof DependencyValueState) {
                if (capturedState && capturedState.value !== newState.value) {
                    handler(self, capturedState.value, newState.value, args);
                }

                capturedState = newState;
            }
        });
    };

    type writable = ITrackableWritableComputedValue<T>;
    if (writeCallback !== undefined) {
        (<writable>self).write = (newValue) => {
            writeCallback(newValue, args, <writable>self);
        };

        return <writable>self;
    }

    return self;
}
