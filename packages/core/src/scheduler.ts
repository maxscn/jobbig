import type { Queue } from "./queue";
import type { RunData } from "./run";
import type { Store } from "./store";

interface SchedulerOpts {
	queue: Queue;
	store: Store;
}

export interface Scheduler {
	schedule(run: RunData): Promise<void>;
}

export function Scheduler({ queue, store }: SchedulerOpts): Scheduler {
	return {
		async schedule(run: RunData) {
			await store.store(run);
			await queue.push(run);
		},
	};
}
