### `itDepends.computed<T>(calculator, writeCallback)`

Creates (parametric)computed value object.

#### Parameters:
* `calculator` *(mandatory, `function (...parameters: any[]) -> T)`* - the function that will be called later to (re)calculate the value of computed value object. Gets called when you request the value for the first time. Next time this function will not get called unless some of dependencies (observable/computed values) is changed. Should return(calculate) the current value of the computed value object. **Must not** have side-effects. Calculator function can take parameters. In this case the resulting computed behaves as a set of elementary computed values bound to each distinct set of arguments. These individual computeds can be accessed with [`withArgs`](../computedValue/withArgs.md) and [`withNoArgs`](../computedValue/withNoArgs.md) methods.
* `writeCallback` *(optional, `function (newValue: T, parameters: any[], self: [writableComputedForArgs](../writableComputedForArgs.md)) -> void`)* - the function that will be called when `write` method is called. New value and parameters information in form a of array are passed in the callback along with the computed value object being modified.

#### Returns:
Type: [`computedValue<T>`](../computedValue.md).
The computed value object.