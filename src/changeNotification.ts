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

var handlers: IChangeHandler<any>[] = [];
var nextHandlerId = 0;

export function subscribe<T>(handler: IChangeHandler<T>): ISubscription {
	var handlerId = ++nextHandlerId;
	
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
}

export function notify<T>(value: IHasValue<T>, from: T, to: T) {
	for (var i = 0; i < handlers.length; i++) {
		handlers[i](value, from, to);
	}
}