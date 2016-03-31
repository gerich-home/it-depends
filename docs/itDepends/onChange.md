### `itDepends.onChange(callback)`
Creates the subscription on a change to any observable value.

#### Parameters:
* `callback` *(mandatory, `function (changed: [observableValue<any>](../observableValue.md), from: any, to: any) -> void`)* - the function that will be called immediately when a change is made to any observable value. The callback receives the changed observable value object, old and new value of observable object.

#### Returns:
Type: [`subscription`](../subscription.md).
The subscription object that can be used to control the subscription.

#### See also:
* [`itDepends`](itDepends.md)
* [`observableValue`](observableValue.md)
* [`computedValue`](computedValue.md)
* [`computedForArgs`](computedForArgs.md)
* [`subscription`](subscription.md)