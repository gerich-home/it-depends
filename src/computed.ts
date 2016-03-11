'use strict';

import * as tracking from './tracking';
import changeNotification, * as changeNotificationTypes from './changeNotification';

export type ISubscription = changeNotificationTypes.ISubscription;

export interface ICalculator<T> {
	(params: any[]): T;
}

export interface IWriteCallback<T> {
	(newValue: T, args: any[], changedValue: IWritableComputedValue<T>): void;
}

export interface IComputedValueChangeHandler<T> {
	(changed: IComputedValue<T>, from: T, to: T, args: any[]): void;
}

export interface IComputedValue<T> extends changeNotificationTypes.IHasValue<T> {
	onChange(handler: IComputedValueChangeHandler<T>): ISubscription;
}

export interface IWritableComputedValue<T> extends IComputedValue<T> {
	write(newValue: T): void;
}

export function computed<T>(calculator: ICalculator<T>, args: any[]): IComputedValue<T>;
export function computed<T>(calculator: ICalculator<T>, args: any[], writeCallback: IWriteCallback<T>): IWritableComputedValue<T>;
export default function computed<T>(calculator: ICalculator<T>, args: any[], writeCallback?: IWriteCallback<T>): IComputedValue<T> | IWritableComputedValue<T> {
	var currentValue: T;

	interface IDependency {
		observableValue: changeNotificationTypes.IHasValue<any>,
		capturedValue: any
	}

	interface IDependencyHash {
		[id: number]: IDependency
	}
	
	var dependencies: IDependencyHash;
	
	var id = tracking.takeNextObservableId();
	var lastReadVersion = -1;

	var atLeastOneDependencyChanged = function() {
		for (var dependencyId in dependencies) {
			if (!dependencies.hasOwnProperty(dependencyId))
				continue;

			var dependency = dependencies[dependencyId];

			if (dependency.observableValue() !== dependency.capturedValue) {
				return true;
			}
		}

		return false;
	};

	var self = <IComputedValue<T>>function() {
		var needRecalc = function() {
			return lastReadVersion !== tracking.lastWriteVersion &&
				(!dependencies || atLeastOneDependencyChanged())
		};
		
		if (needRecalc()) {
			dependencies = {};

			tracking
				.trackingWith(function(dependencyId, observableValue, capturedValue) {
					if (dependencies[dependencyId])
						return;

					dependencies[dependencyId] = {
						observableValue: observableValue,
						capturedValue: capturedValue
					};
				})
				.execute(function() {
					currentValue = calculator.apply(null, args);
				});
			
			lastReadVersion = tracking.lastWriteVersion;
		}

		tracking.recordUsage(id, self, currentValue);

		return currentValue;
	};
	
	self.onChange = function(handler: IComputedValueChangeHandler<T>): ISubscription {
		var oldValue = self();
		
		return changeNotification.subscribe(function() {
			var newValue = self();
			
			if(newValue !== oldValue) {
				handler(self, oldValue, newValue, args);
				oldValue = newValue;
			}
		});
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