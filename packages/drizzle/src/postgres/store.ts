import type { Store } from "@jobbig/core";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "./migrate";
import { runs } from "./schema";

interface DrizzlePostgresStoreOpts {
	db: PostgresJsDatabase;
}
export async function DrizzlePostgresStore(
	opts: DrizzlePostgresStoreOpts,
): Promise<Store> {
	const db = opts.db;
	await migrate(db);

	return {
		store(run) {
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
	};
}
