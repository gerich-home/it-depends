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

	var handlers: IValueChangeHandler<T>[] = [];
	
	self.write = function(newValue) {
		if (currentValue === newValue) return;
		
		var oldValue = currentValue;
		currentValue = newValue;
		tracking.lastWriteVersion++;
		
		for (var i = 0; i < handlers.length; i++) {
			handlers[i](self, oldValue, newValue);
		}
		
		changeNotification.notify(self, oldValue, newValue);
	};
	
	self.onChange = function(handler) {
		var subscription = {
			enable: function() {
				if(handlers.indexOf(handler) === -1) {
					handlers.push(handler);
				}
			},
			disable: function() {
				var handlerIndex = handlers.indexOf(handler);
				if(handlerIndex !== -1) {
					handlers.splice(handlerIndex, 1);
				}
			}
		};
		
		subscription.enable();
		
		return subscription;
	};
	
	return self;
};
