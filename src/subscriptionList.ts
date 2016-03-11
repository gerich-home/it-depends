'use strict';

export interface IHasValue<T> {
	(): T;
}

export interface IChangeHandler<T> {
	(changed: IHasValue<T>, from: T, to: T): void;
}

export interface ISubscriptions<T> {
	notify: IChangeHandler<T>;
	subscribe(handler: IChangeHandler<T>): ISubscription;
}

export interface ISubscription {
	enable(): void;
	disable(): void;
}

export default function<T>(): ISubscriptions<T> {
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
				item.handler(changed, from, to);
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
				},
				disable: function() {
					if(!item) { return; }

					item.prev.next = item.next;
					item.next.prev = item.prev;
					
					item = null;
				}
			};
			
			subscription.enable();
			
			return subscription;
		}
	};
}