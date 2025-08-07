import type { JobType } from "./job";
import type { JobbigInstance, JobsFromArray } from "./jobbig";
import { BaseRunner } from "./runner";
import type { QueueInfo } from "./store";

const DEFAULT_CONCURRENCY = 50;

export interface OrchestratorOpts<
	T extends JobType[] = any,
	Metadata = unknown,
	Plugins extends Record<string, any> = {},
> {
	concurrency?: number;
	jobbig: JobbigInstance<T, Metadata, Plugins>;
}

export type Orchestrator = (
	opts: OrchestratorOpts,
) => () => Promise<{ info: QueueInfo; running: Promise<void>[] }>;

export const BaseOrchestrator: Orchestrator = (opts: OrchestratorOpts) => {
	const concurrency = opts.concurrency ?? DEFAULT_CONCURRENCY;
	const jobbig = opts.jobbig;
	const store = jobbig.store;
	let running: WrappedPromise<void>[] = [];
	return async () => {
		running = running.filter((r) => !r.isDone);
		console.log(`Running ${running.length} jobs`);
		console.log(`Waiting for ${concurrency - running.length} jobs`);
		const { runs, info } = await store.poll(concurrency - running.length);
		if (!runs || runs.length === 0) {
			console.log("no runs found");
			return { info, running };
		}
		for (const run of runs) {
			const runner = BaseRunner({ run, jobbig });
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
