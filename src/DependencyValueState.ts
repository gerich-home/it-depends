'use strict';

import { IDependencyState } from './interfaces/IDependencyState';

export default class DependencyValueState<T> implements IDependencyState<T> {
    constructor(public storedValue: T) {}

    public equals(other: IDependencyState<T>): boolean {
        return other instanceof DependencyValueState && other.storedValue === this.storedValue;
    };

    public unwrap(): T {
        return this.storedValue;
    }
}
