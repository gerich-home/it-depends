'use strict';

import { ISubscription } from './subscriptionList';
import { default as computed, IComputedValue, IComputedValueChangeHandler, IWriteCallback, IWritableComputedValue } from './computed';

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

export type IParametricComputed<T> = IParametricComputedValue<T> | IParametricWritableComputedValue<T>

export default function<T>(calculator: ICalculator<T>): IParametricComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, writeCallback: IWriteCallback<T>): IParametricWritableComputedValue<T>;
export default function<T>(calculator: ICalculator<T>, writeCallback?: IWriteCallback<T>): IParametricComputed<T> {
    interface IComputedHash {
        [id: string]: IComputedValue<any>;
    }

    var cache: IComputedHash = {};
    var allArguments = [];

    var self = <IParametricComputedValue<T>>function(): T {
        var computedWithArgs = self.withArgs.apply(undefined, arguments);
        return computedWithArgs();
    };

    self.onChange = function(handler: IComputedValueChangeHandler<T>): ISubscription {
        return self.withNoArgs().onChange(handler);
    };

    self.withNoArgs = function(): IComputedValue<T> {
        return cache[''] ||
            (cache[''] = computed(calculator, [], writeCallback));
    };

    self.withArgs = function(): IComputedValue<T> {
        var key = '';
        var skippingUndefinedValues = true;
        var argsToDrop = 0;

        for (var i = arguments.length - 1; i >= 0; i--) {
            var arg = arguments[i];
            if (skippingUndefinedValues) {
                if (arg === undefined) {
                    argsToDrop++;
                    continue;
                }

                skippingUndefinedValues = false;
            }

            var index = allArguments.indexOf(arg);

            if (index === -1) {
                key += allArguments.length + ':';
                allArguments.push(arg);
            } else {
                key += index + ':';
            }
        }

        return cache[key] ||
            (cache[key] = computed(calculator, Array.prototype.slice.call(arguments, 0, arguments.length - argsToDrop), writeCallback));
    };

    if (writeCallback !== undefined) {
        type writable = IParametricWritableComputedValue<T>;
        (<writable>self).write = (newValue) => (<writable>self).withNoArgs().write(newValue);
        return <writable>self;
    }

    return self;
}
