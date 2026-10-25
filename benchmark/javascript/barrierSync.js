export class AsyncBarrier {
  constructor(parties) {
    if (parties <= 0) {
      throw new Error("Parties must be positive");
    }
    this.parties = parties;
    this.count = parties;
    this.waiters = [];
  }

  wait() {
    this.count--;
    if (this.count === 0) {
      this.count = this.parties;
      const currentWaiters = this.waiters;
      this.waiters = [];
      for (const resolve of currentWaiters) {
        resolve();
      }
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }
}
