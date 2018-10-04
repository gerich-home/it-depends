'use strict';

import { default as computed, IComputedValue, IComputedValueChangeHandler, IWritableComputedValue, IWriteCallback } from './computed';
import { ISubscription } from './subscriptionList';

export interface ICalculator<T> {
    (...params: any[]): T;
}

export interface IParametricComputedValue<T> extends IComputedValue<T> {
    onChange(handler: IComputedValueChangeHandler<T>): ISubscription;
    withNoArgs(): IComputedValue<T>;
    withArgs(...args: any[]): IComputedValue<T>;
}

export interface IParametricWritableComputedValue<T> extends IParametricComputedValue<T>, IWritableComputedValue<T> {
    withNoArgs(): IWritableComputedValue<T>;
    withArgs(...args: any[]): IWritableComputedValue<T>;
}

export type IParametricComputed<T> = IParametricComputedValue<T> | IParametricWritableComputedValue<T>;

interface IComputedHash {
    [id: string]: IComputedValue<any>;
}

export default function<T>(calculator: ICalculator<T>): IParametricComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, writeCallback: IWriteCallback<T>): IParametricWritableComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, writeCallback?: IWriteCallback<T>): IParametricComputed<T> {
    const cache: IComputedHash = {};
    const allArguments = [];

    const self = <IParametricComputedValue<T>>read;

    self.onChange = onChange;
    self.withNoArgs = withNoArgs;
    self.withArgs = withArgs;

    if (writeCallback !== undefined) {
        type writable = IParametricWritableComputedValue<T>;
        (<writable>self).write = (newValue) => (<writable>self).withNoArgs().write(newValue);
        return <writable>self;
    }

    return self;

    function read(...args: any[]): T {
        const computedWithArgs = self.withArgs(...args);
        return computedWithArgs();
    }

    function onChange(handler: IComputedValueChangeHandler<T>): ISubscription {
        return self.withNoArgs().onChange(handler);
    }

    function withNoArgs(): IComputedValue<T> {
        return cache[''] ||
            (cache[''] = computed(calculator, [], writeCallback));
    }

    function withArgs(...args: any[]): IComputedValue<T> {
        let key = '';
        let skippingUndefinedValues = true;
        let argsToDrop = 0;

        for (let i = args.length - 1; i >= 0; i--) {
            const arg = args[i];

            if (skippingUndefinedValues) {
                if (arg === undefined) {
                    argsToDrop++;
                    continue;
                }

                skippingUndefinedValues = false;
            }

            const index = allArguments.indexOf(arg);

            if (index === -1) {
                key += allArguments.length + ':';
                allArguments.push(arg);
            } else {
                key += index + ':';
            }
        }

        return cache[key] ||
            (cache[key] = computed(calculator, Array.prototype.slice.call(args, 0, args.length - argsToDrop), writeCallback));
    }
}
