'use strict';

import changeNotification, * as changeNotificationTypes from './changeNotification';
import * as tracking from './tracking';
import subscriptionList, * as subscriptionTypes from './subscriptionList';

export type ISubscription = subscriptionTypes.ISubscription;

export interface IValueChangeHandler<T> {
	(changed: IValue<T>, from: T, to: T): void;
}

export interface IValue<T> extends subscriptionTypes.IHasValue<T> {
	write(value: T): void;
	onChange(handler: IValueChangeHandler<T>): ISubscription;
}

export default function<T>(initialValue: T): IValue<T> {
	var currentValue = initialValue;
	var id = tracking.takeNextObservableId();
	var subscriptions: subscriptionTypes.ISubscriptions<T>;
	
	var self = <IValue<T>>function() {
		tracking.recordUsage(id, self, currentValue);
		return currentValue;
	};
	
	self.write = function(newValue) {
		if (currentValue === newValue) return;
		
		var oldValue = currentValue;
		currentValue = newValue;
		tracking.lastWriteVersion++;
		
		if(subscriptions) {
			subscriptions.notify(self, oldValue, newValue);
		}
		
		changeNotification.notify(self, oldValue, newValue);
	};
	
	self.onChange = function(handler) {
		if(!subscriptions) {
			subscriptions = subscriptionList<T>();
		}
		
		return subscriptions.subscribe(handler);
	};
	
	return self;
}