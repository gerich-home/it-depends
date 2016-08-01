'use strict';

import subscriptionList from './subscriptionList';
import { ISubscriptions } from './interfaces/ISubscriptions';
import { ITrackableWritableValue } from './interfaces/ITrackableWritableValue';
import { IValueChangeHandler } from './interfaces/IValueChangeHandler';

export var subscriptions: ISubscriptions<IValueChangeHandler<any, ITrackableWritableValue<any>>> =
    subscriptionList<IValueChangeHandler<any, ITrackableWritableValue<any>>>();
