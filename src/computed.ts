'use strict';

import * as tracking from './tracking';
import subscriptionList, * as subscriptionTypes from './subscriptionList';

export type ISubscription = subscriptionTypes.ISubscription;

export interface ICalculator<T> {
	(params: any[]): T;
}

export interface IWriteCallback<T> {
	(newValue: T, args: any[], changedValue: IWritableComputedValue<T>): void;
}

export interface IComputedValueChangeHandler<T> {
	(changed: IComputedValue<T>, from: T, to: T, args: any[]): void;
}

export interface IComputedValue<T> extends subscriptionTypes.IHasValue<T> {
	onChange(handler: IComputedValueChangeHandler<T>): ISubscription;
}

export interface IWritableComputedValue<T> extends IComputedValue<T> {
	write(newValue: T): void;
}

export function computed<T>(calculator: ICalculator<T>, args: any[]): IComputedValue<T>;
export function computed<T>(calculator: ICalculator<T>, args: any[], writeCallback: IWriteCallback<T>): IWritableComputedValue<T>;
export default function computed<T>(calculator: ICalculator<T>, args: any[], writeCallback?: IWriteCallback<T>): IComputedValue<T> | IWritableComputedValue<T> {
	var currentValue: T;
	var oldValue: T;

	interface IDependency {
		observableValue: subscriptionTypes.IHasValue<any>,
		capturedValue: any,
		dependencyId: number,
		subscription?: ISubscription
	}
	
	var dependencies: IDependency[];
	
	var id = tracking.takeNextObservableId();
	var lastReadVersion;
	var subscriptions: subscriptionTypes.ISubscriptions<T>;
	var subscriptionsActive: boolean;

	var atLeastOneDependencyChanged = function() {
		for (var i = 0; i < dependencies.length; i++) {
			var dependency = dependencies[i];

			if (dependency.observableValue() !== dependency.capturedValue) {
				return true;
			}
		}

		return false;
	};

	var unsubscribeDependencies = function() {
		for (var i = 0; i < dependencies.length; i++) {
			var dependency = dependencies[i];
			dependency.subscription.disable();
			dependency.subscription = null;
		}
	};

	var subscribeDependencies = function() {
		for (var i = 0; i < dependencies.length; i++) {
			var dependency = dependencies[i];

			dependency.subscription = dependency.observableValue.onChange(self);
		}
	};

	var self = <IComputedValue<T>>function() {
		if(lastReadVersion !== tracking.lastWriteVersion) {
			lastReadVersion = tracking.lastWriteVersion;
			
			if (!dependencies || atLeastOneDependencyChanged()) {
				interface IDependencyHash {
					[id: number]: IDependency
				}
				
				var dependenciesById: IDependencyHash = {};
				
				var oldDependencies = dependencies;
				dependencies = [];
				
				tracking
					.trackingWith(function(dependencyId, observableValue, capturedValue) {
						if (dependenciesById[dependencyId])
							return;
						
						var dependency = {
							dependencyId: dependencyId,
							observableValue: observableValue,
							capturedValue: capturedValue
						};

						dependenciesById[dependencyId] = dependency;
						dependencies.push(dependency);
					})
					.execute(function() {
						if(subscriptionsActive) {
							oldValue = currentValue;
						}
						
						currentValue = calculator.apply(null, args);
					});
				
				if(subscriptionsActive) {
					if(oldDependencies) {
						for (var i = 0; i < oldDependencies.length; i++) {
							var oldDependency = oldDependencies[i];
							var newDependency = dependenciesById[oldDependency.dependencyId];

							if(newDependency) {
								newDependency.subscription = oldDependency.subscription;
							}
						}
					}
				
					for (var i = 0; i < dependencies.length; i++) {
						var dependency = dependencies[i];
						dependency.subscription = dependency.subscription || dependency.observableValue.onChange(self);
					}
					
					if(oldDependencies) {
						for (var i = 0; i < oldDependencies.length; i++) {
							var oldDependency = oldDependencies[i];
							var newDependency = dependenciesById[oldDependency.dependencyId];

							if(!newDependency) {
								oldDependency.subscription.disable();
							}
						}
						
						oldDependencies = undefined;
					}
					
					dependenciesById = undefined;
						
					if(oldValue !== currentValue) {
						subscriptions.notify(self, oldValue, currentValue, args);
					}
				}
			}
		}

		tracking.recordUsage(id, self, currentValue);

		return currentValue;
	};
	
	self.onChange = function(handler: IComputedValueChangeHandler<T>): ISubscription {
		subscriptions = subscriptions || subscriptionList<T>({
			activated: function() {
				oldValue = self();
				
				if(dependencies) {
					subscribeDependencies();
				}
				
				subscriptionsActive = true;
			},
			deactivated: function() {
				oldValue = undefined;
				
				if(dependencies) {
					unsubscribeDependencies();
				}
				
				subscriptionsActive = false;
			}
		});
		
		return subscriptions.subscribe(handler);
	};
	
	type writable = IWritableComputedValue<T>;
	if(writeCallback !== undefined) {
		(<writable>self).write = (newValue) => {
			writeCallback(newValue, args, <writable>self);
		};
		
		return <writable>self;
	}

	return self;
}