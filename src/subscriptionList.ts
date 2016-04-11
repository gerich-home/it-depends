'use strict';

export interface IHasValue<T> {
    (): T;
    onChange(handler: IValueChangeHandler<T>): ISubscription;
}

export interface IDependencyState<T> {
    equals(other: IDependencyState<T>): boolean;
    unwrap(): T;
}

export interface IValueChangeHandler<T> {
    (changed: IHasValue<T>, from: T, to: T): void;
}

export interface IStateChangeHandler<T> {
    (from: IDependencyState<T>, to: IDependencyState<T>): void;
}

export interface ISubscribe<TChangeHandler> {
    (handler: TChangeHandler): ISubscription;
}

export interface ISubscriptions<TChangeHandler> {
    notify: TChangeHandler;
    subscribe: ISubscribe<TChangeHandler>;
}

export interface ISubscription {
    enable(): void;
    disable(): void;
}

export interface IStateListener {
    activated(): void;
    deactivated(): void;
}

export default function<TChangeHandler>(stateListener?: IStateListener): ISubscriptions<TChangeHandler> {
    interface ILinkedListItem {
        next: ILinkedListItem;
        prev: ILinkedListItem;
        handler?: TChangeHandler;
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
        notify: <TChangeHandler><any>function(): void {
            var item = head.next;
            while (item !== tail) {
                (<any>item.handler).apply(undefined, arguments);
                item = item.next;
            }
        },
        subscribe: function(handler: TChangeHandler): ISubscription {
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
