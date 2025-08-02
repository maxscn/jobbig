import type { Run, Store } from "@jobbig/core";

type State = {
	[runId: string]: Run;
};
export function LocalStore(state: State): Store {
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
