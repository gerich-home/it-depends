### `computedValue<T>(...parameters)`
Reads the current value of computed value object for the given set of parameters. `calculator` will be called if it is the first call or if a change was made to some of the dependencies (values/computeds) called from calculator previous time. Otherwise the cached current value will be returned.
During the call dependencies (values/computeds) used in the calculator will be recorded and stored in the list of dependencies.
Same as `computedValue.withArgs(...parameters)()`

#### Parameters:
* `parameters` *(varadic, `any[]`)* - parameters that will be passed to the `calculator`. Calculator will be called only once for each unique set of parameters unless dependencies are changed. Trailing `undefined` values are dropped.

#### Returns:
Type: `T`.
The current value of computed value object for the given parameters.

#### See also:
* [`itDepends`](../itDepends.md)
* [`observableValue`](../observableValue.md)
* [`computedValue`](../computedValue.md)
* [`computedForArgs`](../computedForArgs.md)
* [`subscription`](../subscription.md)