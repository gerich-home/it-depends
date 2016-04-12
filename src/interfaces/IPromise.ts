'use strict';

export interface IPromise<T> {
    then<U>(continuation: (resolved: T) => U): any;
    then(continuation: (resolved: T) => void): any;
}
