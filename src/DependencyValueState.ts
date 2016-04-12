'use strict';

import { IDependencyState } from './interfaces/IDependencyState';

export default class DependencyValueState<T> implements IDependencyState<T> {
    constructor(public value: T) {}

    public equals(other: IDependencyState<T>): boolean {
        return other instanceof DependencyValueState && other.value === this.value;
    };

    public unwrap(): T {
        return this.value;
    }
}
