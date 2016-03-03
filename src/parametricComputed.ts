'use strict';

import computed, * as computedTypes from './computed'

export interface IParametricComputedValue<TWithNoArgs> extends computedTypes.IComputedValue<TWithNoArgs> {
	onChange(handler: computedTypes.IComputedValueChangeHandler<TWithNoArgs>): computedTypes.ISubscription;
	withNoArgs(): computedTypes.IComputedValue<TWithNoArgs>;
	withArgs<TWithArgs>(...args: any[]): computedTypes.IComputedValue<TWithArgs>;
}

export default function<TWithNoArgs>(calculator: (...params: any[]) => TWithNoArgs): IParametricComputedValue<TWithNoArgs> {
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
		return cache[key] || (cache[key] = computed(calculator, args));
	};
	
	return self;
}