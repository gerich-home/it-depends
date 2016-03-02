'use strict';

import * as changeNotification from './changeNotification';
import * as tracking from './tracking';

export type ISubscription = changeNotification.ISubscription;

export interface IValueChangeHandler<T> {
	(changed: IValue<T>, from: T, to: T): void;
};

export interface IValue<T> extends changeNotification.IHasValue<T> {
	write(value: T): void;
	onChange(handler: IValueChangeHandler<T>): ISubscription;
};

export default function<T>(initialValue: T): IValue<T> {
	var currentValue = initialValue;
	var id = tracking.takeNextObservableId();

	var self = <IValue<T>>function() {
		tracking.recordUsage(id, self, currentValue);
		return currentValue;
	};

	self.write = function(newValue) {
		if (currentValue === newValue) return;
		
		var oldValue = currentValue;
		currentValue = newValue;
		tracking.lastWriteVersion++;
		
		changeNotification.notify(self, oldValue, newValue);
	};
	
	self.onChange = function(handler) {
		return changeNotification.subscribe<T>(function(changed, from, to) {
			if(changed === self) {
				handler(self, from, to);
			}
		});
	};
	
	return self;
};
