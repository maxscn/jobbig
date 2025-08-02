import type { Queue } from "./queue";
import type { Run } from "./run";
import type { MetadataStore } from "./store";

interface PublishOpts {
	queue: Queue;
	store: MetadataStore;
}
export function Publisher({ queue, store }: PublishOpts) {
	return async (run: Run) => {
		await store.store(run);
		await queue.push(run);
	};
}
