'use strict';

export interface IParametricValue<T, TBaseValue> {
    (...args: any[]): T;
    withNoArgs(): TBaseValue;
    withArgs(...args: any[]): TBaseValue;
}
