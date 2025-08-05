import { desc, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrations } from "./migrations";
import { migrations as migrationsTable } from "./schema";
export async function migrate(db: PostgresJsDatabase<Record<string, unknown>>) {
	const step = await db
		.select()
		.from(migrationsTable)
		.orderBy(desc(migrationsTable.id))
		.limit(1)
		.then((res) => res?.[0]?.id ?? 0)
		.catch(() => 0);

	for (const migration of migrations.slice(step)) {
		await db.execute(migration);
		await db.execute(
			sql`insert into jobbig_migrations (created_at) values (now())`,
		);
	}
}
