'use strict';

import * as tracking from './tracking';
import { IDependencyState } from './tracking';
import { default as subscriptionList, ISubscription, ISubscriptions, IHasValue } from './subscriptionList';
import { valueChanged } from './bulkChange';
import { onChangeFinished } from './change';

export interface ICalculator<T> {
    (params: any[]): T;
}

export interface IWriteCallback<T> {
    (newValue: T, args: any[], changedValue: IWritableComputedValue<T>): void;
}

export interface IComputedValueChangeHandler<T> {
    (changed: IComputedValue<T>, from: T, to: T, args: any[]): void;
}

export interface IComputedValue<T> extends IHasValue<T> {
    onChange(handler: IComputedValueChangeHandler<T>): ISubscription;
}

export interface IWritableComputedValue<T> extends IComputedValue<T> {
    write(newValue: T): void;
}

export type IComputed<T> = IComputedValue<T> | IWritableComputedValue<T>

var statesAreDifferent = function<T>(a: IDependencyState<T>, b: IDependencyState<T>): boolean {
    return a.value !== b.value ||
        a.error !== b.error;
};

export default function<T>(calculator: ICalculator<T>, args: any[]): IComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, args: any[], writeCallback: IWriteCallback<T>): IWritableComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, args: any[], writeCallback?: IWriteCallback<T>): IComputed<T> {
    var currentState: IDependencyState<T>;
    var oldState: IDependencyState<T>;

    interface IDependency {
        dependencyId: number;
        getState: () => IDependencyState<any>;
        capturedState: IDependencyState<any>;
        observableValue: IHasValue<any>;
        subscription?: ISubscription;
    }

    var dependencies: IDependency[];
    var id = tracking.takeNextObservableId();
    var lastReadVersion;
    var subscriptions: ISubscriptions<T>;
    var subscriptionsActive: boolean;
    var self: IComputed<T>;

    var atLeastOneDependencyChanged = function(): boolean {
        return tracking.executeWithTracker(() => {
            for (var dependency of dependencies) {
                if (statesAreDifferent(dependency.getState(), dependency.capturedState)) {
                    return true;
                }
            }

            return false;
        });
    };

    var notifySubscribers = function(oldValue: T, newValue: T): void {
        subscriptions.notify(self, oldValue, newValue, args);
    };

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

        if (subscriptionsActive) {
            oldState = currentState;
        }

        var tracker = function(dependencyId: number, observableValue: IHasValue<any>, getState: () => IDependencyState<any>): void {
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
            currentState = {
                value: tracking.executeWithTracker(() => calculator.apply(undefined, args), tracker)
            };
        } catch (e) {
            currentState = {
                error: e
            };
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

            if (statesAreDifferent(currentState, oldState)) {
                valueChanged(id, self, oldState.value, notifySubscribers);
            }
        }
    };

    var getCurrentState = function(): IDependencyState<T> {
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

        if (currentState.error) {
            throw currentState.error;
        }

        return currentState.value;
    };

    self.onChange = function(handler: IComputedValueChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<T>({
            activated: function(): void {
                oldState = getCurrentState();

                if (dependencies) {
                    subscribeDependencies();
                }

                subscriptionsActive = true;
            },
            deactivated: function(): void {
                oldState = undefined;

                if (dependencies) {
                    unsubscribeDependencies();
                }

                subscriptionsActive = false;
            }
        });

        return subscriptions.subscribe(handler);
    };

    type writable = IWritableComputedValue<T>;
    if (writeCallback !== undefined) {
        (<writable>self).write = (newValue) => {
            writeCallback(newValue, args, <writable>self);
        };

        return <writable>self;
    }

    return self;
}
