'use strict';

export interface IHasValue<T> {
	(): T;
	onChange(handler: IChangeHandler<T>): ISubscription;
}

export interface IChangeHandler<T> {
	(changed: IHasValue<T>, from: T, to: T, ...other: any[]): void;
}

export interface ISubscriptions<T> {
	notify: IChangeHandler<T>;
	subscribe(handler: IChangeHandler<T>): ISubscription;
}

export interface ISubscription {
	enable(): void;
	disable(): void;
}

export interface IStateListener {
	activated(): void;
	deactivated(): void;
}

export default function<T>(stateListener?: IStateListener): ISubscriptions<T> {
	interface ILinkedListItem {
		prev: ILinkedListItem,
		next: ILinkedListItem,
		handler?: IChangeHandler<T>
	}
	
	var head: ILinkedListItem = {
		prev: null,
		next: null
	};
	
	var tail: ILinkedListItem = {
		prev: head,
		next: null
	};
	
	head.next = tail;

	return {
		notify: function(changed, from, to) {
			var item = head.next;
			while(item !== tail) {
				item.handler.apply(null, arguments);
				item = item.next;
			}
		},
		subscribe: function(handler) {
			var item: ILinkedListItem = null;
			
			var subscription = {
				enable: function() {
					if(item) { return; }
					
					item = {
						prev: head,
						next: head.next,
						handler: handler
					};
					
					head.next.prev = item;
					head.next = item;
					
					if(stateListener && stateListener.activated && item.next === tail) {
						stateListener.activated();
					}
				},
				disable: function() {
					if(!item) { return; }

					item.prev.next = item.next;
					item.next.prev = item.prev;
					
					item = null;
					
					if(stateListener && stateListener.deactivated && head.next === tail) {
						stateListener.deactivated();
					}
				}
			};
			
			subscription.enable();
			
			return subscription;
		}
	};
}