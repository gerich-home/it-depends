'use strict';

export interface IDependencyState<T> {
    equals(other: IDependencyState<T>): boolean;
    unwrap(): T;
}
