'use strict';

import computed, * as computedTypes from './computed'

export type IWriteCallback<T> = computedTypes.IWriteCallback<T>

export interface ICalculator<T> {
	(...params: any[]): T;
}

export interface IParametricComputedValue<T> extends computedTypes.IComputedValue<T> {
	onChange(handler: computedTypes.IComputedValueChangeHandler<T>): computedTypes.ISubscription;
	withNoArgs(): computedTypes.IComputedValue<T>;
	withArgs(...args: any[]): computedTypes.IComputedValue<T>;
}

export interface IParametricWritableComputedValue<T> extends IParametricComputedValue<T>, computedTypes.IWritableComputedValue<T> {
}

export function parametricComputed<T>(calculator: ICalculator<T>): IParametricComputedValue<T>;
export function parametricComputed<T>(calculator: ICalculator<T>, writeCallback: IWriteCallback<T>): IParametricWritableComputedValue<T>;
export default function parametricComputed<T>(calculator: ICalculator<T>, writeCallback?: IWriteCallback<T>): IParametricComputedValue<T> | IParametricWritableComputedValue<T> {
	interface IComputedHash {
		[id: string]: computedTypes.IComputedValue<any>
	}
	
	var cache: IComputedHash = {};
	var allArguments = [];
	
	var self = <IParametricComputedValue<T>>function() {
		var computedWithArgs = self.withArgs.apply(null, arguments);
		return computedWithArgs();
	};
	
	self.onChange = function(handler) {
		return self.withNoArgs().onChange(handler);
	};
	
	self.withNoArgs = function() {
		return self.withArgs();
	};
	
	self.withArgs = function() {
		var key = '';
		var skippingUndefinedValues = true;
		var argsToDrop = 0;
		
		for(var i = arguments.length - 1; i >= 0; i--) {
			var arg = arguments[i];
			if(skippingUndefinedValues) {
				if(arg === undefined) {
					argsToDrop++
					continue;
				}
				
				skippingUndefinedValues = false;
			}
			
			var index = allArguments.indexOf(arg);
		
			if(index === -1) {
				key += allArguments.length + ":";
				allArguments.push(arg);
			} else {
				key += index + ":";
			}
		}
		
		var args = Array.prototype.slice.call(arguments, 0, arguments.length - argsToDrop);
		return cache[key] || (cache[key] = computed(calculator, args, writeCallback));
	};
	
	if(writeCallback !== undefined) {
		(<IParametricWritableComputedValue<T>>self).write = (newValue) => self.withNoArgs().write(newValue);
		return <IParametricWritableComputedValue<T>>self;
	}
	
	return self;
}