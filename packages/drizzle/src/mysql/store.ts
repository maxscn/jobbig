import type { Store } from "@jobbig/core";
import { eq } from "drizzle-orm";
import type { MySqlDatabase } from "drizzle-orm/mysql2";
import { migrate } from "./migrate";
import { runs } from "./schema";

interface DrizzleMySQLStoreOpts {
	db: MySqlDatabase<any, any>;
}
export async function DrizzleMySQLStore(
	opts: DrizzleMySQLStoreOpts,
): Promise<Store> {
	const db = opts.db;
	await migrate(db);

	return {
		async store(run) {
			await db
				.insert(runs)
				.values(run)
				.onDuplicateKeyUpdate({ set: { ...run } });
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
			await db
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
	};
}
