'use strict';

import { IComputedValueChangeHandler } from './IComputedValueChangeHandler';
import { ITrackableComputedValue } from './ITrackableComputedValue';
import { IParametricValue } from './IParametricValue';
import { ITrackable } from './ITrackable';

export interface ITrackableParametricComputedValue<T>
    extends IParametricValue<T, ITrackableComputedValue<T>>,
            ITrackable<IComputedValueChangeHandler<T, ITrackableComputedValue<T>>> {
}
