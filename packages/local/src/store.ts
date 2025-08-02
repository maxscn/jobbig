import type { MetadataStore, Run, RunStatus } from "@jobbig/core";

type Store = {
	[runId: string]: Run;
};
export function LocalStore(state: Store): MetadataStore {
	const store = state;

	return {
		async set(runId, key, value) {
			if (!store?.[runId]) {
				throw new Error(`Run ${runId} does not exist`);
			}
			store[runId] = { ...store[runId], [key]: value };
		},
		async get(runId, key) {
			return store?.[runId]?.[key];
		},
		async store(run) {
			store[run.id] = run;
		},
		async fetch(runId) {
			return store?.[runId];
		},
	};
}
