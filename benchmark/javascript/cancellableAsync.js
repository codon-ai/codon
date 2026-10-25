export class CancellationToken {
  constructor() {
    this.isCancelled = false;
    this.listeners = [];
  }

  cancel() {
    this.isCancelled = true;
    for (const listener of this.listeners) {
      listener();
    }
    this.listeners = [];
  }

  onCancel(cb) {
    if (this.isCancelled) {
      cb();
      return () => {};
    }
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }
}

export function cancellableDelay(ms, token) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    token.onCancel(() => {
      clearTimeout(timer);
      reject(new Error("Operation cancelled"));
    });
  });
}
