const AbstractPipeline = require("./abstract-pipeline"),
  Queue = require("bull");

class QueuePipeline extends AbstractPipeline {
  constructor() {
    super();
    this.initialized = false;
    this.queues = [];
  }
  use(filter) {
    this.queues.push(new Queue(filter.name));
    return super.use(filter);
  }
  async run(input) {
    try {
      if (this.queues.length > 0) {
        if (!this.initialized) {
          for (let i = 0; i < this.queues.length; i++) {
            let queue = this.queues[i];
            let filter = this.filters[i];
            let next = this.queues.length !== i + 1 ? this.queues[i + 1] : null;

            if (next) {
              await queue.process((job, done) => {
                let result = filter.call(this, job.data);
                next.add(result, { removeOnComplete: true });
                done();
              });
            } else {
              await queue.on("completed", (job) => {
                this.emit("end", job.data);
              });
            }
          }
          this.initialized = true;
        }
        let queue = this.queues[0];
        queue.add(input, { removeOnComplete: true });
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
}

module.exports = QueuePipeline;
