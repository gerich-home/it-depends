'use strict';

import { default as subscriptionList, ISubscriptions, IValueChangeHandler } from './subscriptionList';

var subscriptions: ISubscriptions<IValueChangeHandler<any>> = subscriptionList<IValueChangeHandler<any>>();

export default subscriptions;
