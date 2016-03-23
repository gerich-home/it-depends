'use strict';

import value from './value';
import { default as computed, IComputedValue } from './computed';

export interface IPromise<T> {
    then<U>(continuation: (resolved: T) => U): any;
    then(continuation: (resolved: T) => void): any;
}

export default function<T>(promise: IPromise<T>, initialValue?: T): IComputedValue<T> {
    var currentValue = value(initialValue);

    promise.then(currentValue.write);

    return computed(currentValue, []);
}
