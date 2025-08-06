import type { RunData, Store } from "@jobbig/core";

type State = {
	[runId: string]: RunData;
};
export function LocalStore(state: State): Store {
	const store = state;

	return {
		async poll(maxAmt: number) {
			const now = new Date();
			const jobs = Object.values(store).filter((job) => job.scheduledAt <= now);
			const exhausted = jobs.length < maxAmt;
			const runs = Object.values(store).splice(
				0,
				Math.min(maxAmt, jobs.length),
			);
			return Promise.resolve({
				runs,
				info: { exhausted },
			});
		},
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
		async push(run) {
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
			};
			return true;
		},
		async isLocked(runId) {
			const status = await this.get(runId, "status");
			return status === "pending";
		},
	};
}
