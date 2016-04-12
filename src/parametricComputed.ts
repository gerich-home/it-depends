'use strict';

import computed from './computed';
import { IParametricCalculator } from './interfaces/IParametricCalculator';
import { IWriteCallback } from './interfaces/IWriteCallback';
import { IParametricComputedValue } from './interfaces/IParametricComputedValue';
import { ITrackableParametricComputedValue } from './interfaces/ITrackableParametricComputedValue';
import { ITrackableWritableParametricComputedValue } from './interfaces/ITrackableWritableParametricComputedValue';
import { IComputedValue } from './interfaces/IComputedValue';
import { ITrackableComputedValue } from './interfaces/ITrackableComputedValue';
import { ISubscription } from './interfaces/ISubscription';
import { IComputedValueChangeHandler } from './interfaces/IComputedValueChangeHandler';

export default function<T>(calculator: IParametricCalculator<T>): ITrackableParametricComputedValue<T>;
export default function<T>(calculator: IParametricCalculator<T>,
                           writeCallback: IWriteCallback<T>): ITrackableWritableParametricComputedValue<T>;
export default function<T>(calculator: IParametricCalculator<T>, writeCallback?: IWriteCallback<T>): IParametricComputedValue<T> {
    interface IComputedHash {
        [id: string]: IComputedValue<any>;
    }

    var cache: IComputedHash = {};
    var allArguments = [];

    var self = <IParametricComputedValue<T>>function(): T {
        var computedWithArgs = self.withArgs.apply(undefined, arguments);
        return computedWithArgs();
    };

    self.onChange = function(handler: IComputedValueChangeHandler<T, ITrackableComputedValue<T>>): ISubscription {
        return self.withNoArgs().onChange(handler);
    };

    self.withNoArgs = function(): ITrackableComputedValue<T> {
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
        type writable = ITrackableWritableParametricComputedValue<T>;
        (<writable>self).write = (newValue) => (<writable>self).withNoArgs().write(newValue);
        return <writable>self;
    }

    return self;
}
