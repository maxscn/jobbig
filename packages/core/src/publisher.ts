import type { Queue } from "./queue";
import type { RunData } from "./run";
import type { Store } from "./store";

interface PublishOpts {
	queue: Queue;
	store: Store;
}

export interface Publisher {
	publish(run: RunData): Promise<void>;
}

export function Publisher({ queue, store }: PublishOpts): Publisher {
	return {
		async publish(run: RunData) {
			await store.store(run);
			await queue.push(run);
		},
	};
}
