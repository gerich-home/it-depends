'use strict';

export interface ICalculator<T> {
    (params: any[]): T;
}
