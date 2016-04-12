'use strict';

import { IValue } from './IValue';
import { IWritableValue } from './IWritableValue';
import { ITrackable } from './ITrackable';
import { IComputedValueChangeHandler } from './IComputedValueChangeHandler';

export interface ITrackableWritableComputedValue<T>
    extends IValue<T>,
            IWritableValue<T>,
            ITrackable<IComputedValueChangeHandler<T, ITrackableWritableComputedValue<T>>> {
}
