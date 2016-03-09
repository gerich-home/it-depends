'use strict';

export interface IHasValue<T> {
	(): T;
}

export interface ISubscription {
	enable(): void;
	disable(): void;
}

export interface IChangeHandler<T> {
	(changed: IHasValue<T>, from: T, to: T): void;
}

interface IHandlersHash {
	[id: number]: IChangeHandler<any>
}

var handlers: IHandlersHash = {};
var nextHandlerId = 0;

export function subscribe<T>(handler: IChangeHandler<T>): ISubscription {
	var handlerId = ++nextHandlerId;
	
	var subscription = {
		enable: function() {
			handlers[handlerId] = handler;
		},
		disable: function() {
			delete handlers[handlerId];
		}
	};
	
	subscription.enable();
	
	return subscription;
}

export function notify<T>(value: IHasValue<T>, from: T, to: T) {
	for (var handlerId in handlers) {
		if (!handlers.hasOwnProperty(handlerId))
			continue;
		
		handlers[handlerId](value, from, to);
	}
}