'use strict';

export interface IStateChangeHandler<TState> {
    (newState: TState): void;
}
