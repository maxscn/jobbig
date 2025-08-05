import type { Queue, RunData } from "@jobbig/core";
import { and, eq, lte } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "./migrate";
import { runs } from "./schema";

interface DrizzleQueueOpts {
	db: PostgresJsDatabase;
	margin?: number;
}

export async function DrizzlePostgresQueue(
	opts: DrizzleQueueOpts,
): Promise<Queue> {
	const db = opts.db;
	const margin = opts.margin ?? 0;
	await migrate(db);

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
		async push(runData: RunData) {
			await db.insert(runs).values(runData);
		},
	};
}
