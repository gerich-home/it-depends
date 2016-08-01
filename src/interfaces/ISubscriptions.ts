'use strict';

import { ISubscription } from './ISubscription';

export interface ISubscribe<TChangeHandler> {
    (handler: TChangeHandler): ISubscription;
}

export interface ISubscriptions<TChangeHandler> {
    subscribe: ISubscribe<TChangeHandler>;
    forEach(callback: (handler: TChangeHandler) => void): void;
    active(): boolean;
}
