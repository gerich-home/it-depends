'use strict';

import * as changeNotification from './changeNotification';
import value, * as valueTypes from './value';
import parametricComputed, * as parametricComputedTypes from './parametricComputed';
import * as computedTypes from './computed';
import promiseValue, * as promiseValueTypes from './promiseValue';

export = {
	onChange: changeNotification.subscribe,
	value: value,
	computed: parametricComputed,
	promiseValue: promiseValue
};
