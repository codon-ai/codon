# Custom Event Emitter
Create a strongly-typed EventEmitter class in a single file without external libraries.

Requirements:
- Type `Listener = (...args: any[]) => void`.
- Export class `EventEmitter`: internal `events = new Map<string, Listener[]>()`.
- Method `on(event: string, listener: Listener): this`: registers listener.
- Method `once(event: string, listener: Listener): this`: registers listener that removes itself after one invocation before calling original listener.
- Method `off(event: string, listener: Listener): this`: unregisters listener.
- Method `emit(event: string, ...args: any[]): boolean`: calls all registered listeners with args. Returns `true` if listeners existed, `false` otherwise.
- Method `listenerCount(event: string): number`: returns number of active listeners for event.
