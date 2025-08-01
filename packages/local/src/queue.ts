import type { Queue, Run } from "@jobbig/core";

export function LocalQueue(initialRuns: Run[] = []): Queue {
  const queue: Run[] = initialRuns;
  return {
    async push(job: Run) {
      return Promise.resolve(queue.push(job));

    },
	async poll(maxAmt: number) {
      const now = new Date();
      const jobs = queue.filter((job) => job.scheduledAt <= now);
      const exhausted = jobs.length < maxAmt;
      const runs = queue.splice(0, Math.min(maxAmt, jobs.length));
      return Promise.resolve({
        runs,
        info: { exhausted },
      });
    }
  }
}
