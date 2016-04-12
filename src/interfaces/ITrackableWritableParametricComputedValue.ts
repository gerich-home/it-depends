'use strict';

import { IComputedValueChangeHandler } from './IComputedValueChangeHandler';
import { ITrackableWritableComputedValue } from './ITrackableWritableComputedValue';
import { IParametricValue } from './IParametricValue';
import { IWritableValue } from './IWritableValue';
import { ITrackable } from './ITrackable';

export interface ITrackableWritableParametricComputedValue<T>
    extends IParametricValue<T, ITrackableWritableComputedValue<T>>,
            IWritableValue<T>,
            ITrackable<IComputedValueChangeHandler<T, ITrackableWritableComputedValue<T>>> {
}
