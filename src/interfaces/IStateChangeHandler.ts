'use strict';

import { IDependencyState } from './IDependencyState';

export interface IStateChangeHandler<T> {
    (newState: IDependencyState<T>): void;
}
