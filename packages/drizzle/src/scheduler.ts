import type { Scheduler } from "@jobbig/core";
import type { MySqlDatabase } from "drizzle-orm/mysql-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DrizzleMySQLStore } from "./mysql/store";
import { DrizzlePostgresStore } from "./postgres/store";

type DrizzleConfigOpts =
	| {
			dialect: "mysql";
			db: MySqlDatabase<any, any>;
	  }
	| {
			dialect: "postgresql";
			db: PostgresJsDatabase;
	  }
	| { dialect: "" };

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
		if (opts.dialect === "mysql") {
			return DrizzleMySQLStore(opts);
		} else if (opts.dialect === "postgresql") {
			return DrizzlePostgresStore(opts);
		}
		throw new Error(`Unsupported dialect: ${opts.dialect}`);
	}

	const store = await createStore(opts);
	return {
		schedule(run) {
			return store.store(run);
		},
	};
}
