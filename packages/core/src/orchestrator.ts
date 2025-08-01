import type { Job } from "./job";
import type { Queue, QueueInfo } from "./queue";
import { step } from "./step";
import type { MetadataStore } from "./store";

const DEFAULT_POLL_AMOUNT = 10;

export interface OrchestratorOpts {
	amount?: number;
	queue: Queue;
	store: MetadataStore;
	jobs: Job<any>[];
}

export type Orchestrator = (opts: OrchestratorOpts) => () => Promise<QueueInfo>;

export const orchestrator: Orchestrator = (opts: OrchestratorOpts) => {
	const amount = opts.amount ?? DEFAULT_POLL_AMOUNT;
	const queue = opts.queue;
	const store = opts.store;
	const jobs = opts.jobs;
	return async () => {
		const { runs, info } = await queue.poll(amount);
		if (!runs || runs.length === 0) {
      console.log("no runs found")
      return info;
		}
		for (const run of runs) {
      const status = await store.getStatus(run.id);
      if (status !== "pending") {
        continue;
			}
		  await store.setStatus(run.id, "running")
			const job = jobs.find((job) => job.id === run.jobId);
			if (!job) {
			  console.log("no job matches the run")
				await store.setStatus(run.id, "failure");
        continue;
			}
			try {
			  await job.run({
					ctx: {
						data: run.data,
						step: step({
							currentStep: run.currentStep,
							runId: run.id,
							setCurrentStep: async (step) => await store.setCurrentStep(run.id, step)
						})
					}
				});
			  await store.setStatus(run.id, "success")
			} catch (err) {
        console.error(err);
				await store.setStatus(run.id, "failure");
			}
		}
    return info;
	};
};
