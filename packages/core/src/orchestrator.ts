import type { Job } from "./job";
import type { Queue, QueueInfo } from "./queue";
import { BaseRunner } from "./runner";
import type { Store } from "./store";

const DEFAULT_CONCURRENCY = 50;

export interface OrchestratorOpts {
	concurrency?: number;
	queue: Queue;
	store: Store;
	jobs: Job[];
}

export type Orchestrator = (
	opts: OrchestratorOpts,
) => () => Promise<{ info: QueueInfo; running: Promise<void>[] }>;

export const BaseOrchestrator: Orchestrator = (opts: OrchestratorOpts) => {
	const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY;
	const queue = opts.queue;
	const store = opts.store;
	const jobs = opts.jobs;
	let running: WrappedPromise<void>[] = [];
	return async () => {
		running = running.filter((r) => !r.isDone);
		console.log(`Running ${running.length} jobs`);
		console.log(`Waiting for ${concurrency - running.length} jobs`);
		const { runs, info } = await queue.poll(concurrency - running.length);
		if (!runs || runs.length === 0) {
			console.log("no runs found");
			return { info, running };
		}
		for (const run of runs) {
			const runner = BaseRunner({ run, store, jobs });
			running.push(WrappedPromise(runner.run()));
		}
		// At least one promise should be done before the next poll
		await Promise.race(running);
		return { info, running };
	};
};

interface WrappedPromise<T> extends Promise<T> {
	isDone: boolean;
}

function WrappedPromise<T>(promise: Promise<T>): WrappedPromise<T> {
	const wrapped = promise as WrappedPromise<T>;
	wrapped.isDone = false;
	// biome-ignore lint/suspicious/noAssignInExpressions: don't think it can be done in another way
	wrapped.then(() => (wrapped.isDone = true));
	// biome-ignore lint/suspicious/noAssignInExpressions: don't think it can be done in another way
	wrapped.catch(() => (wrapped.isDone = true));
	return wrapped;
}
