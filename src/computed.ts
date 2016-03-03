'use strict';

import * as tracking from './tracking';
import * as changeNotification from './changeNotification';

export type ISubscription = changeNotification.ISubscription;

export interface IComputedValueChangeHandler<T> {
	(changed: IComputedValue<T>, from: T, to: T, args: any[]): void;
}

export interface IComputedValue<T> extends changeNotification.IHasValue<T> {
	onChange(handler: IComputedValueChangeHandler<T>): ISubscription;
}

export default function computed<T>(calculator: (...params: any[]) => T, args: any[]): IComputedValue<T> {
	var currentValue: T;

	interface IDependency {
		observableValue: changeNotification.IHasValue<any>,
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

	return self;
}