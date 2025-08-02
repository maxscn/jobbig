import type { Queue } from "./queue";
import type { Run } from "./run";
import type { Store } from "./store";

interface PublishOpts {
	queue: Queue;
	store: Store;
}
export function Publisher({ queue, store }: PublishOpts) {
	return {
		async publish(run: Run) {
			await store.store(run);
			await queue.push(run);
		},
	};
}
