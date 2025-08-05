import type { Queue, RunData } from "@jobbig/core";
import { and, eq, lte } from "drizzle-orm";
import type { MySql2Database, MySqlDatabase } from "drizzle-orm/mysql2";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { migrate } from "./migrate";
import { runs } from "./schema";

interface DrizzleQueueOpts {
	db: MySqlDatabase<any, any> | PlanetScaleDatabase | MySql2Database;
	margin?: number;
}

export async function DrizzleMySQLQueue(
	opts: DrizzleQueueOpts,
): Promise<Queue> {
	const margin = opts.margin ?? 0;
	const db = opts.db;
	await migrate(db);

	return {
		async poll(amount) {
			const rows = await db.transaction((tx) =>
				tx
					.select()
					.from(runs)
					.limit(amount + 1)
					.where(
						and(
							eq(runs.status, "pending"),
							lte(runs.scheduledAt, new Date(Date.now() + margin)),
						),
					),
			);
			const exhausted = rows.length <= amount;
			return { runs: rows, info: { exhausted } };
		},
		async push(runData: RunData) {
			await db.transaction(async (tx) =>
				tx
					.insert(runs)
					.values(runData)
					.onDuplicateKeyUpdate({ set: { ...runData } }),
			);
		},
	};
}
