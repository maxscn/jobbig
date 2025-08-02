import type { Job } from "./job";
import type { Queue, QueueInfo } from "./queue";
import { BaseRunner } from "./runner";
import type { Store } from "./store";

const DEFAULT_POLL_AMOUNT = 10;

export interface OrchestratorOpts {
	amount?: number;
	queue: Queue;
	store: Store;
	jobs: Job[];
}

export type Orchestrator = (opts: OrchestratorOpts) => () => Promise<QueueInfo>;

export const BaseOrchestrator: Orchestrator = (opts: OrchestratorOpts) => {
	const amount = opts.amount ?? DEFAULT_POLL_AMOUNT;
	const queue = opts.queue;
	const store = opts.store;
	const jobs = opts.jobs;
	return async () => {
		const { runs, info } = await queue.poll(amount);
		if (!runs || runs.length === 0) {
			console.log("no runs found");
			return info;
		}
		for (const run of runs) {
			const runner = BaseRunner({ run, store, jobs });
			await runner.run();
		}
		return info;
	};
};
