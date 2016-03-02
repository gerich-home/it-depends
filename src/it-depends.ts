'use strict';

import * as changeNotification from './changeNotification';
import value, * as valueTypes from './value';
import parametricComputed, * as parametricComputedTypes from './parametricComputed';
import * as computedTypes from './computed';
import promiseValue, * as promiseValueTypes from './promiseValue';

export type ISubscription = changeNotification.ISubscription;
export type IParametricComputedValue<T> = parametricComputedTypes.IParametricComputedValue<T>;
export type IComputedValue<T> = computedTypes.IComputedValue<T>;
export type IValue<T> = valueTypes.IValue<T>;
export type IPromise<T> = promiseValueTypes.IPromise<T>;

export default {
	onChange: changeNotification.subscribe,
	value: value,
	computed: parametricComputed,
	promiseValue: promiseValue
};
