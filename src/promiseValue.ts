'use strict';

import { default as computed, IComputedValue } from './computed';
import value from './value';

export interface IPromise<T> {
    then<U>(continuation: (resolved: T) => U): any;
    then(continuation: (resolved: T) => void): any;
}

export default function<T>(promise: IPromise<T>, initialValue?: T): IComputedValue<T> {
    const currentValue = value(initialValue);

    promise.then(currentValue.write);

    return computed(currentValue, []);
}
