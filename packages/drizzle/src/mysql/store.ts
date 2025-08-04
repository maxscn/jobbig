import type { Store } from "@jobbig/core";
import type { Config } from "drizzle-kit";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { runs } from "./schema";

interface DrizzleMySQLStoreOpts {
	drizzleConfig: Config;
}
export async function DrizzleMySQLStore(
	opts: DrizzleMySQLStoreOpts,
): Promise<Store> {
	const db = drizzle(opts.drizzleConfig);
	await migrate(db, {
		migrationsFolder: "./migrations",
		migrationsTable: "jobbig_migrations",
	});

	return {
		async store(run) {
			await db.insert(runs).values(run);
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
