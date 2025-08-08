// https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-seed/src/index.ts

import { MySqlDatabase } from "drizzle-orm/mysql-core"
import { PgDatabase } from "drizzle-orm/pg-core"
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core"

export type AnyPostgresDatabase = PgDatabase<any, any>
export type AnyMySqlDatabase = MySqlDatabase<
  any, any
>
export type AnySQLiteDatabase = BaseSQLiteDatabase<"sync" | "async", any, any>

export type SqlFlavorOptions =
  | AnyPostgresDatabase
  | AnyMySqlDatabase
  | AnySQLiteDatabase

