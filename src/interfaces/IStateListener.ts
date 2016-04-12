'use strict';

export interface IStateListener {
    activated(): void;
    deactivated(): void;
}
