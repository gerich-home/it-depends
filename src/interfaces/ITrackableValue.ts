'use strict';

import { IValue } from './IValue';
import { ITrackable } from './ITrackable';

export interface ITrackableValueChangeHandler<T> {
    (changed: ITrackableValue<T>, from: T, to: T): void;
}

export interface ITrackableValue<T>
    extends IValue<T>,
            ITrackable<ITrackableValueChangeHandler<T>> {
}
