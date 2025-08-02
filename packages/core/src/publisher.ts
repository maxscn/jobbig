import type { Queue } from "./queue";
import type { Run } from "./run";
import type { Store } from "./store";

interface PublishOpts {
	queue: Queue;
	store: Store;
}

export interface Publisher {
	publish: (run: Run) => Promise<void>;
}

export function Publisher({ queue, store }: PublishOpts): Publisher {
	return {
		async publish(run: Run) {
			await store.store(run);
			await queue.push(run);
		},
	};
}
