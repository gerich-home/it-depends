'use strict';

import { IDependencyState } from './interfaces/IDependencyState';

export default class DependencyErrorState implements IDependencyState<any> {
    constructor(private error: any) {}

    public equals(other: IDependencyState<any>): boolean {
        return other instanceof DependencyErrorState && other.error === this.error;
    };

    public unwrap(): any {
        throw this.error;
    }
}
