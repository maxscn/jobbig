import type { Store } from "@jobbig/core";
import type { AnyMySqlDatabase, SqlFlavorOptions } from "./drizzle-type";
import { is } from "drizzle-orm";
import { MySqlDatabase } from "drizzle-orm/mysql-core";
import { DrizzleMySQLStore } from "./mysql";
import { DrizzlePostgresStore } from "./postgres";
import { PgDatabase } from "drizzle-orm/pg-core";

type DrizzleStore<DB extends SqlFlavorOptions> = {
    db: MySqlDatabase<any, any> | PgDatabase<any, any> | { [key: string]: any };
    margin?: number;
}

export function DrizzleStore<DB extends SqlFlavorOptions>({db, ...opts}: DrizzleStore<DB>): Promise<Store> {
    if (is(db, MySqlDatabase<any, any>)) {7
        return DrizzleMySQLStore({ db, ...opts });
    } else if (is(db, PgDatabase<any, any>)) {
        return DrizzlePostgresStore({ db, ...opts });
    }
    throw new Error("Unsupported database type. Please use MySQL or Postgres.");
}