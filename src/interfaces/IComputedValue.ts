'use strict';

import { ITrackableComputedValue } from './ITrackableComputedValue';
import { ITrackableWritableComputedValue } from './ITrackableWritableComputedValue';

export type IComputedValue<T> = ITrackableComputedValue<T> | ITrackableWritableComputedValue<T>
