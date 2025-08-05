import type { RunData, Store } from "@jobbig/core";

type State = {
	[runId: string]: RunData;
};
export function LocalStore(state: State): Store {
	const store = state;

	return {
		async set(runId, key, value) {
			if (!store?.[runId]) {
				throw new Error(`Run ${runId} does not exist`);
			}
			console.log(`setting ${runId}.${key} = ${value}`);
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
		async lock(runId) {
			if (!store?.[runId]) {
				throw new Error(`Run ${runId} does not exist`);
			}
			if (store?.[runId].status !== "pending") {
				return false;
			}
			console.log(`locking ${runId}`);
			store[runId] = {
				...store[runId],
				status: "pending",
				startedAt: new Date(),
			};
			return true;
		},
		async unlock(runId) {
			if (!store?.[runId]) {
				throw new Error(`Run ${runId} does not exist`);
			}
			if (store?.[runId].status !== "pending") {
				return false;
			}
			console.log(`unlocking ${runId}`);
			store[runId] = {
				...store[runId],
				status: "pending",
				startedAt: null,
			};
			return true;
		},
		async isLocked(runId) {
			const status = await this.get(runId, "status");
			return status === "pending";
		},
	};
}
