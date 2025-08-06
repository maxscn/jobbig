import type { Store } from "@jobbig/core";
import { and, eq, lte } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "./migrate";
import { runs } from "./schema";

interface DrizzlePostgresStoreOpts {
	db: PostgresJsDatabase;
	margin?: number;
}
export async function DrizzlePostgresStore(
	opts: DrizzlePostgresStoreOpts,
): Promise<Store> {
	const db = opts.db;
	await migrate(db);
	const margin = opts.margin ?? 0;

	return {
		async poll(amount) {
			const rows = await db
				.select()
				.from(runs)
				.limit(amount + 1)
				.where(
					and(
						eq(runs.status, "pending"),
						lte(runs.scheduledAt, new Date(Date.now() + margin)),
					),
				);
			const exhausted = rows.length <= amount;
			return { runs: rows, info: { exhausted } };
		},
		push(run) {
			return db.insert(runs).values(run);
		},
		async get(runId, key) {
			return db
				.select({ [key]: runs[key] })
				.from(runs)
				.where(eq(runs.id, runId))
				.then((rows) => {
					if (rows.length === 0) return undefined;
					return rows?.[0]?.[key];
				});
		},
		async set(runId, key, value) {
			return db
				.update(runs)
				.set({ [key]: value })
				.where(eq(runs.id, runId));
		},
		async fetch(runId) {
			return db
				.select()
				.from(runs)
				.where(eq(runs.id, runId))
				.then((rows) => {
					if (rows.length === 0) return undefined;
					return rows?.[0];
				});
		},
		async lock(runId) {
			const rows = await db.transaction((tx) =>
				tx
					.update(runs)
					.set({ status: "running", startedAt: new Date() })
					.where(and(eq(runs.id, runId), eq(runs.status, "pending"))),
			);
			return rows.length > 0;
		},
		async unlock(runId) {
			const rows = await db.transaction(async (tx) =>
				tx
					.update(runs)
					.set({ status: "pending" })
					.where(and(eq(runs.id, runId), eq(runs.status, "running"))),
			);
			return rows.length > 0;
		},
		async isLocked(runId) {
			const rows = await db.transaction(async (tx) =>
				tx.select({ status: runs.status }).from(runs).where(eq(runs.id, runId)),
			);
			return rows.length > 0 && rows?.[0]?.status === "running";
		},
	};
}
