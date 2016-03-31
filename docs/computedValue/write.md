### `computedValue<T>.write(newValue)`
Calls write callback for the computed passing empty arguments set.
Same as `computedValue.withNoArgs().write(newValue)`

#### Parameters:
* `newValue` *(mandatory, `T`)* - the new value to write to computed object.

#### Returns:
Type: `void`.

#### See also:
* [`itDepends`](itDepends.md)
* [`observableValue`](observableValue.md)
* [`computedValue`](computedValue.md)
* [`computedForArgs`](computedForArgs.md)
* [`subscription`](subscription.md)