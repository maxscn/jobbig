import type { Queue, RunData } from "@jobbig/core";
import { and, eq, lte } from "drizzle-orm";
import type { MySqlDatabase } from "drizzle-orm/mysql2";
import { migrate } from "./migrate";
import { runs } from "./schema";

interface DrizzleQueueOpts {
	db: MySqlDatabase<any, any>;
}

export async function DrizzleMySQLQueue(
	opts: DrizzleQueueOpts,
): Promise<Queue> {
	const db = opts.db;
	await migrate(db);

	return {
		async poll(amount) {
			const rows = await db
				.select()
				.from(runs)
				.limit(amount + 1)
				.where(
					and(eq(runs.status, "pending"), lte(runs.scheduledAt, new Date())),
				);
			const exhausted = rows.length <= amount;
			return { runs: rows, info: { exhausted } };
		},
		async push(runData: RunData) {
			await db
				.insert(runs)
				.values(runData)
				.onDuplicateKeyUpdate({ set: { ...runData } });
		},
	};
}
