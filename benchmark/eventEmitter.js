export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  on(event, listener) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(listener);
    return this;
  }
  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener(...args);
    };
    return this.on(event, wrapper);
  }
  off(event, listener) {
    if (!this.events.has(event)) return this;
    const filtered = this.events.get(event).filter(l => l !== listener);
    if (filtered.length) this.events.set(event, filtered);
    else this.events.delete(event);
    return this;
  }
  emit(event, ...args) {
    if (!this.events.has(event)) return false;
    const listeners = [...this.events.get(event)];
    listeners.forEach(l => l(...args));
    return true;
  }
  listenerCount(event) {
    return this.events.get(event)?.length || 0;
  }
}
