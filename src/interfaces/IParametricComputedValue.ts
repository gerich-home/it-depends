'use strict';

import { ITrackableParametricComputedValue } from './ITrackableParametricComputedValue';
import { ITrackableWritableParametricComputedValue } from './ITrackableWritableParametricComputedValue';

export type IParametricComputedValue<T> = ITrackableParametricComputedValue<T> | ITrackableWritableParametricComputedValue<T>
