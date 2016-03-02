'use strict';

import * as tracking from './tracking';
import value from './value';
import computed, * as computedTypes from './computed';

export type IComputedValue<T> = computedTypes.IComputedValue<T>
export interface IPromise<T> {
	then<U>(continuation: (resolved: T) => U): any
	then(continuation: (resolved: T) => void): any
}

export default function<T>(promise: IPromise<T>, initialValue?: T): IComputedValue<T> {
	var currentValue = value(initialValue);

	promise.then(currentValue.write);

	return computed(currentValue, []);
}
