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
	var nextId = 0;

	interface ILinkedListItem {
		prev: ILinkedListItem,
		next: ILinkedListItem,
		handler: IValueChangeHandler<T>,
	};
	
	var self = <IValue<T>>function() {
		tracking.recordUsage(id, self, currentValue);
		return currentValue;
	};

	var handlersHead: ILinkedListItem = {
		prev: null,
		next: null,
		handler: null
	};
	
	self.write = function(newValue) {
		if (currentValue === newValue) return;
		
		var oldValue = currentValue;
		currentValue = newValue;
		tracking.lastWriteVersion++;
		
		var item = handlersHead.next;
		while(item) {
			item.handler(self, oldValue, newValue);
			item = item.next;
		}
		
		changeNotification.notify(self, oldValue, newValue);
	};
	
	self.onChange = function(handler) {
		var item: ILinkedListItem = null;
		
		var subscription = {
			enable: function() {
				if(!item) {
					item = {
						prev: handlersHead,
						next: handlersHead.next,
						handler: handler
					};
					
					handlersHead.next = item;
				}
			},
			disable: function() {
				if(item) {
					item.prev.next = item.next;
					if(item.next) { item.next.prev = item.prev; }
					
					handlersHead = item;
					item = null;
				}
			}
		};
		
		subscription.enable();
		
		return subscription;
	};
	
	return self;
};
