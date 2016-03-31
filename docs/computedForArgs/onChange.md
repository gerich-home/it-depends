### `computedForArgs<T>.onChange(callback)`
Creates the subscription on a change to this computed value with the given set of arguments.

#### Parameters:
* `callback` *(mandatory, `function (changed: [`computedForArgs<T>`](../computedForArgs.md), from: T, to: T, args: any[]) -> void`)* - the function that will be called immediately when a change is made to one of dependencies that leads to a change of computed value. The callback receives the changed computedValue, old and new value of computed object and the given set of arguments.

#### Returns:
Type: [`subscription`](../subscription.md).
The subscription object that can be used to control the subscription.