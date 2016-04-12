'use strict';

export interface IParametricCalculator<T> {
    (...params: any[]): T;
}
