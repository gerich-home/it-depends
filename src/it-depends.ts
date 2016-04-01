'use strict';

import parametricComputed from './parametricComputed';
import changeNotification from './changeNotification';
import promiseValue from './promiseValue';
import value from './value';
import bulkChange from './bulkChange';

import { ISubscribe } from './subscriptionList';

var onChange: ISubscribe<any> = changeNotification.subscribe;

export {
    parametricComputed as computed,
    onChange,
    promiseValue,
    value,
    bulkChange
};
