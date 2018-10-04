'use strict';

import { valueChanged } from './bulkChange';
import { onChangeFinished } from './change';
import { default as subscriptionList, IHasValue, ISubscription, ISubscriptions } from './subscriptionList';
import * as tracking from './tracking';

export interface ICalculator<T> {
    (...params: any[]): T;
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

export type IComputed<T> = IComputedValue<T> | IWritableComputedValue<T>;

interface IDependency {
    capturedValue: any;
    dependencyId: number;
    observableValue: IHasValue<any>;
    subscription?: ISubscription;
}

interface IDependencyHash {
    [id: number]: IDependency;
}

export default function<T>(calculator: ICalculator<T>, args: any[]): IComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, args: any[], writeCallback: IWriteCallback<T>): IWritableComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, args: any[], writeCallback?: IWriteCallback<T>): IComputed<T> {
    let currentValue: T;
    let oldValue: T;

    let dependencies: IDependency[];
    const id = tracking.takeNextObservableId();
    let lastReadVersion;
    let subscriptions: ISubscriptions<T>;
    let subscriptionsActive: boolean;
    const self = <IComputedValue<T>>read;

    self.onChange = onChange;

    type writable = IWritableComputedValue<T>;
    if (writeCallback !== undefined) {
        (<writable>self).write = (newValue) => {
            writeCallback(newValue, args, <writable>self);
        };

        return <writable>self;
    }

    return self;

    function atLeastOneDependencyChanged(): boolean {
        return tracking.executeWithTracker(() => {
            for (const dependency of dependencies) {
                if (dependency.observableValue() !== dependency.capturedValue) {
                    return true;
                }
            }

            return false;
        });
    }

    function unsubscribeDependencies(): void {
        for (const dependency of dependencies) {
            dependency.subscription.disable();
            dependency.subscription = undefined;
        }
    }

    function subscribeDependencies(): void {
        for (const dependency of dependencies) {
            dependency.subscription = dependency.observableValue.onChange(self);
        }
    }

    function notifySubscribers(oldValue: T, newValue: T): void {
        subscriptions.notify(self, oldValue, newValue, args);
    }

    function onChange(handler: IComputedValueChangeHandler<T>): ISubscription {
        subscriptions = subscriptions || subscriptionList<T>({
            activated(): void {
                oldValue = self();

                if (dependencies) {
                    subscribeDependencies();
                }

                subscriptionsActive = true;
            },
            deactivated(): void {
                oldValue = undefined;

                if (dependencies) {
                    unsubscribeDependencies();
                }

                subscriptionsActive = false;
            }
        });

        return subscriptions.subscribe(handler);
    }

    function read(): T {
        if (lastReadVersion !== tracking.state.lastWriteVersion) {
            lastReadVersion = tracking.state.lastWriteVersion;

            if (!dependencies || atLeastOneDependencyChanged()) {
                executeCalculator();
            }
        }

        tracking.recordUsage(id, self, currentValue);

        return currentValue;
    }

    function executeCalculator(): void {
        const dependenciesById: IDependencyHash = {};

        const oldDependencies = dependencies;
        dependencies = [];

        if (subscriptionsActive) {
            oldValue = currentValue;
        }

        currentValue = tracking.executeWithTracker(() => calculator(...args), tracker);

        if (subscriptionsActive) {
            if (oldDependencies) {
                for (const oldDependency of oldDependencies) {
                    const newDependency = dependenciesById[oldDependency.dependencyId];

                    if (newDependency !== undefined) {
                        newDependency.subscription = oldDependency.subscription;
                    }
                }
            }

            for (const dependency of dependencies) {
                dependency.subscription = dependency.subscription || dependency.observableValue.onChange(self);
            }

            if (oldDependencies) {
                onChangeFinished(() => {
                    for (const oldDependency of oldDependencies) {
                        const newDependency = dependenciesById[oldDependency.dependencyId];

                        if (newDependency === undefined) {
                            oldDependency.subscription.disable();
                        }
                    }
                });
            }

            if (oldValue !== currentValue) {
                valueChanged(id, self, oldValue, notifySubscribers);
            }
        }

        function tracker(dependencyId: number, observableValue: any, capturedValue: any): void {
            if (dependenciesById[dependencyId] !== undefined) {
                return;
            }

            const dependency = {
                capturedValue: capturedValue,
                dependencyId: dependencyId,
                observableValue: observableValue
            };

            dependenciesById[dependencyId] = dependency;
            dependencies.push(dependency);
        }
    }
}
