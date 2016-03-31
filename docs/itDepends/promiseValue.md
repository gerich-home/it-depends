### `itDepends.promiseValue<T>(promise, initialValue)`

Creates promise value wrapper object.

#### Parameters:
* `promise` *(mandatory, `[Promise<T>](https://promisesaplus.com/#point-21)`)* - the promise object that is the source of the value.
* `initialValue` *(optional, `T`, `undefined` by default)* - the value to be stored in the promise value when created.

#### Returns:
Type: [`computedForArgs<T>`](../computedForArgs.md).
The promise value object filled with the `initialValue` or `undefined` if none specified.
Depending on the concrete Promise implementation can be immediately filled with the value of a Promise if it was resolved already.

#### See also:
* [`itDepends`](../itDepends.md)
* [`observableValue`](../observableValue.md)
* [`computedValue`](../computedValue.md)
* [`computedForArgs`](../computedForArgs.md)
* [`subscription`](../subscription.md)