'use strict';

import { IWritableValue } from './IWritableValue';
import { IValue } from './IValue';
import { ITrackable } from './ITrackable';
import { IValueChangeHandler } from './IValueChangeHandler';

export interface ITrackableWritableValue<T>
    extends IValue<T>,
            IWritableValue<T>,
            ITrackable<IValueChangeHandler<T, ITrackableWritableValue<T>>> {
}
