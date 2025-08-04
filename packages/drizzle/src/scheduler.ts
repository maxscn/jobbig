import type { Scheduler } from "@jobbig/core";
import type { Config } from "drizzle-kit";
import { DrizzleMySQLStore } from "./mysql/store";
import { DrizzlePostgresStore } from "./postgres/store";

type DrizzleConfigOpts = {
	drizzleConfig: Config;
};

/**
 * This scheduler only sends one request to your database for each publish. This works because the queue and store reads from the same table.
 * @param opts {
 *    drizzleConfig: Config
 * }
 * @returns Scheduler
 */
export async function DrizzleScheduler(
	opts: DrizzleConfigOpts,
): Promise<Scheduler> {
	async function createStore(opts: DrizzleConfigOpts) {
		if (opts.drizzleConfig.dialect === "mysql") {
			return DrizzleMySQLStore(opts);
		} else if (opts.drizzleConfig.dialect === "postgresql") {
			return DrizzlePostgresStore(opts);
		}
		throw new Error(`Unsupported dialect: ${opts.drizzleConfig.dialect}`);
	}

	const store = await createStore(opts);
	return {
		schedule(run) {
			return store.store(run);
		},
	};
}
