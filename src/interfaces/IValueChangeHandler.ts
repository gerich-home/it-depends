'use strict';

export interface IValueChangeHandler<T, TValue> {
    (changed: TValue, from: T, to: T): void;
}
