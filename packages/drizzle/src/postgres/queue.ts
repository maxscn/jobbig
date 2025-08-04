import type { Queue, RunData } from "@jobbig/core";
import type { Config } from "drizzle-kit";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { runs } from "./schema";

interface DrizzleQueueOpts {
	drizzleConfig: Config;
}

export async function DrizzleMySQLQueue(
	opts: DrizzleQueueOpts,
): Promise<Queue> {
	const db = drizzle(opts.drizzleConfig);
	await migrate(db, {
		migrationsFolder: "./migrations",
		migrationsTable: "jobbig_migrations",
	});

	return {
		async poll(amount) {
			const rows = await db
				.select()
				.from(runs)
				.limit(amount + 1)
				.where(and(eq(runs.status, "pending")));
			const exhausted = rows.length <= amount;
			return { runs: rows, info: { exhausted } };
		},
		async push(runData: RunData) {
			await db.insert(runs).values(runData);
		},
	};
}
