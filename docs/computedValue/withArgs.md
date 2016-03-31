### `computedValue<T>.withArgs(...parameters)`
Returns the computed value object for the fixed set of parameters. `parameters` denote the set of arguments that will be used in `calculator` later.

#### Parameters:
* `parameters` *(varadic, `any[]`)* - parameters that will be passed to the `calculator`. Calculator will be called with this set only once unless dependencies are changed. Trailing `undefined` values are dropped.

#### Returns:
Type: [`computedForArgs<T>`](../computedForArgs.md).
The computed value object for the given set of parameters.

#### See also:
* [`itDepends`](itDepends.md)
* [`observableValue`](observableValue.md)
* [`computedValue`](computedValue.md)
* [`computedForArgs`](computedForArgs.md)
* [`subscription`](subscription.md)