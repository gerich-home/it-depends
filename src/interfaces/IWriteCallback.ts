'use strict';

import { ITrackableWritableComputedValue } from './ITrackableWritableComputedValue';

export interface IWriteCallback<T> {
    (newValue: T, args: any[], changedValue: ITrackableWritableComputedValue<T>): void;
}
