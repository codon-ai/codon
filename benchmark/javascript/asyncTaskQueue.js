export class AsyncTaskQueue {
  queue = [];
  activeCount = 0;

  constructor(concurrency) {
    this.concurrency = concurrency;
  }

  add(task) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.activeCount++;
        try {
          resolve(await task());
        } catch (err) {
          reject(err);
        } finally {
          this.activeCount--;
          const next = this.queue.shift();
          if (next) next();
        }
      };

      if (this.activeCount < this.concurrency) {
        run();
      } else {
        this.queue.push(run);
      }
    });
  }

  get pending() {
    return this.queue.length;
  }
}

const queue = new AsyncTaskQueue(2);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tasks = [1, 2, 3, 4].map((id) =>
  queue.add(async () => {
    await delay(50);
    return `Task ${id} done`;
  })
);

Promise.all(tasks).then(console.log);
