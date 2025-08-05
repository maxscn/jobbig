import { desc, sql } from "drizzle-orm";
import type { MySqlDatabase } from "drizzle-orm/mysql2";
import { migrations } from "./migrations";
import { migrations as migrationsTable } from "./schema";
export async function migrate(db: MySqlDatabase<any, any>) {
	const step = await db
		.select()
		.from(migrationsTable)
		.orderBy(desc(migrationsTable.id))
		.limit(1)
		.then((res) => res?.[0]?.id ?? 0)
		.catch(() => 0);

	for (const migration of migrations.slice(step)) {
		await db.execute(migration);
		await db.insert(migrationsTable).values({ created_at: new Date() });
	}
}
