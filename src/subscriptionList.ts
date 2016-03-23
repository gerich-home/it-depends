'use strict';

export interface IHasValue<T> {
    (): T;
    onChange(handler: IChangeHandler<T>): ISubscription;
}

export interface IChangeHandler<T> {
    (changed: IHasValue<T>, from: T, to: T, args?: any[]): void;
}

export interface ISubscribe<T> {
    (handler: IChangeHandler<T>): ISubscription;
}

export interface ISubscriptions<T> {
    notify: IChangeHandler<T>;
    subscribe: ISubscribe<T>;
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
        next: ILinkedListItem;
        prev: ILinkedListItem;
        handler?: IChangeHandler<T>;
    }

    var head: ILinkedListItem = {
        next: undefined,
        prev: undefined
    };

    var tail: ILinkedListItem = {
        next: undefined,
        prev: head
    };

    head.next = tail;

    return {
        notify: function(changed: IHasValue<T>, from: T, to: T, args: any[]): void {
            var item = head.next;
            while (item !== tail) {
                item.handler(changed, from, to, args);
                item = item.next;
            }
        },
        subscribe: function(handler: IChangeHandler<T>): ISubscription {
            var item: ILinkedListItem = undefined;

            var subscription = {
                disable: function(): void {
                    if (!item) {
                        return;
                    }

                    item.prev.next = item.next;
                    item.next.prev = item.prev;

                    if (stateListener && head.next === tail) {
                        stateListener.deactivated();
                    }

                    item = undefined;
                },
                enable: function(): void {
                    if (item) { return; }

                    item = {
                        handler: handler,
                        next: head.next,
                        prev: head
                    };

                    head.next.prev = item;
                    head.next = item;

                    if (stateListener && item.next === tail) {
                        stateListener.activated();
                    }
                }
            };

            subscription.enable();

            return subscription;
        }
    };
}
