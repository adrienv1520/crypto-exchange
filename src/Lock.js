// simple lock system (fifo)
module.exports = class Lock {
  constructor() {
    this.isLocked = false;
    this.queue = [];
  }

  async acquire(asyncFunc) {
    if (!this.isLocked) {
      this.isLocked = true;
      await asyncFunc();
    } else {
      this.queue.push(asyncFunc);
    }
  }

  async release() {
    if (this.queue.length > 0) {
      const nextAsyncFunc = this.queue.shift();
      await nextAsyncFunc();
    } else {
      this.isLocked = false;
    }
  }
};
