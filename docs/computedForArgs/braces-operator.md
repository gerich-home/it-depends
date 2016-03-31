### `computedForArgs<T>()`
Reads the current value of computed value object for the given set of parameters. `calculator` will be called if it is the first call or if a change was made to some of the dependencies (values/computeds) called from calculator previous time. Otherwise the cached current value will be returned.
During the call dependencies (values/computeds) used in the calculator will be recorded and stored in the list of dependencies.

#### Returns:
Type: `T`.
The current value of computed value object for the given parameters.