# Mini Pub-Sub State Store
Create a minimal standalone reactive state store in a single file without external libraries.

Requirements:
- Export interface `Store<T> { getState: () => T; setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void; subscribe: (listener: (state: T) => void) => () => void; }`.
- Export function `createStore<T extends Record<string, any>>(initialState: T): Store<T>`.
- Store maintains internal `state: T` and a `Set<(state: T) => void>` of listeners.
- `getState()` returns current `state`.
- `setState(partial)` merges new fields into `state = { ...state, ...updates }`, and notifies each subscriber with the updated state.
- `subscribe(listener)` adds listener to set and returns an unsubscribe function `() => listeners.delete(listener)`.
