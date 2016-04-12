'use strict';

export interface IWritableValue<T> {
    write(newValue: T): void;
}
