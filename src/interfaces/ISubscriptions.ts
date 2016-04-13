'use strict';

import { ISubscription } from './ISubscription';

export interface ISubscribe<TChangeHandler> {
    (handler: TChangeHandler): ISubscription;
}

export interface ISubscriptions<TChangeHandler> {
    notify: TChangeHandler;
    subscribe: ISubscribe<TChangeHandler>;
    active(): boolean;
}
