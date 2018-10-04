'use strict';

import bulkChange from './bulkChange';
import changeNotification from './changeNotification';
import parametricComputed from './parametricComputed';
import promiseValue from './promiseValue';
import { ISubscribe } from './subscriptionList';
import value from './value';


const onChange: ISubscribe<any> = changeNotification.subscribe;

export { parametricComputed as computed, onChange, promiseValue, value, bulkChange };

