'use strict';

import value from './value';
import { default as computed } from './computed';
import { ITrackableValue } from './interfaces/ITrackableValue';
import { IPromise } from './interfaces/IPromise';

export default function<T>(promise: IPromise<T>, initialValue?: T): ITrackableValue<T> {
    var currentValue = value(initialValue);

    promise.then(currentValue.write);

    return computed(currentValue, []);
}
