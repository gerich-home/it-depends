'use strict';

import computed, * as computedTypes from './computed'

export interface IParametricComputedValue<TWithNoArgs> extends computedTypes.IComputedValue<TWithNoArgs> {
	onChange(handler: computedTypes.IComputedValueChangeHandler<TWithNoArgs>): computedTypes.ISubscription;
	withNoArgs(): computedTypes.IComputedValue<TWithNoArgs>;
	withArgs<TWithArgs>(...args: any[]): computedTypes.IComputedValue<TWithArgs>;
}

export interface IParametricWritableComputedValue<TWithNoArgs> extends IParametricComputedValue<TWithNoArgs>, computedTypes.IWritableComputedValue<TWithNoArgs> {
}

export function parametricComputed<TWithNoArgs>(calculator: (...params: any[]) => TWithNoArgs): IParametricComputedValue<TWithNoArgs>;
export function parametricComputed<TWithNoArgs>(calculator: (...params: any[]) => TWithNoArgs, writeCallback: (newValue: TWithNoArgs, args: any[]) => void): IParametricWritableComputedValue<TWithNoArgs>;
export default function parametricComputed<TWithNoArgs>(calculator: (...params: any[]) => TWithNoArgs, writeCallback?: (newValue: TWithNoArgs, args: any[]) => void): IParametricComputedValue<TWithNoArgs> | IParametricWritableComputedValue<TWithNoArgs> {
	interface IComputedHash {
		[id: string]: computedTypes.IComputedValue<any>
	}
	
	var cache: IComputedHash = {};
	var allArguments = [];
	
	var self = <IParametricComputedValue<TWithNoArgs>>function() {
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
		(<IParametricWritableComputedValue<TWithNoArgs>>self).write = (newValue) => self.withNoArgs().write(newValue);
		return <IParametricWritableComputedValue<TWithNoArgs>>self;
	}
	
	return self;
}