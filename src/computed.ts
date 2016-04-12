'use strict';

import * as tracking from './tracking';
import { DependencyValueState, DependencyErrorState } from './tracking';
import { default as subscriptionList, ISubscriptions, IDependencyState, IHasValue, ISubscription,
    IValueChangeHandler, IStateChangeHandler } from './subscriptionList';
import { valueChanged } from './bulkChange';
import { onChangeFinished } from './change';

export interface ICalculator<T> {
    (params: any[]): T;
}

export interface IWriteCallback<T> {
    (newValue: T, args: any[], changedValue: IWritableComputedValue<T>): void;
}

export interface IComputedValueChangeHandler<T> extends IValueChangeHandler<T> {
    (changed: IComputedValue<T>, from: T, to: T, args: any[]): void;
}

export interface IComputedValue<T> extends IHasValue<T> {
    onChange(handler: IComputedValueChangeHandler<T>): ISubscription;
}

export interface IWritableComputedValue<T> extends IComputedValue<T> {
    write(newValue: T): void;
}

export type IComputed<T> = IComputedValue<T> | IWritableComputedValue<T>

var getValueState = function<T>(state: IDependencyState<T>): DependencyValueState<T> {
    return state instanceof DependencyValueState ? state : undefined;
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
    var subscriptions: ISubscriptions<IStateChangeHandler<T>>;
    var subscriptionsActive: boolean;
    var self: IComputed<T>;

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

            if (!currentState.equals(oldState)) {
                valueChanged(id, getCurrentState, oldState, subscriptions.notify);
            }
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

    self.onChange = function(handler: IComputedValueChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<IStateChangeHandler<T>>({
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

        var capturedState = getValueState(getCurrentState());
        return subscriptions.subscribe((from: IDependencyState<T>, to: IDependencyState<T>) => {
            if (to instanceof DependencyValueState) {
                if (capturedState && capturedState.value !== to.value) {
                    handler(self, capturedState.value, to.value, args);
                }

                capturedState = to;
            }
        });
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
