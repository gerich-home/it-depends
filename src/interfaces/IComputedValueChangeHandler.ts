'use strict';

export interface IComputedValueChangeHandler<T, TValue> {
    (changed: TValue, from: T, to: T, args: any[]): void;
}
