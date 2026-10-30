export class AsyncTaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.queue = [];
    this.activeCount = 0;
  }
  get pending() { return this.queue.length; }
  add(task) {
    return new Promise((resolve, reject) => {
      const run = () => {
        this.activeCount++;
        task().then(resolve, reject).finally(() => {
          this.activeCount--;
          if (this.queue.length > 0) this.queue.shift()();
        });
      };
      if (this.activeCount < this.concurrency) run();
      else this.queue.push(run);
    });
  }
}
const q = new AsyncTaskQueue(2);
const delay = ms => new Promise(r => setTimeout(r, ms));
Promise.all([1, 2, 3, 4].map(id => q.add(async () => { await delay(50); return `Task ${id} done`; }))).then(console.log);
