'use strict';

import { IValue } from './IValue';
import { ITrackable } from './ITrackable';
import { IComputedValueChangeHandler } from './IComputedValueChangeHandler';

export interface ITrackableComputedValue<T>
    extends IValue<T>,
            ITrackable<IComputedValueChangeHandler<T, ITrackableComputedValue<T>>> {
}
