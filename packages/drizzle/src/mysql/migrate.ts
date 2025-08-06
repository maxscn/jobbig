import { desc, sql } from "drizzle-orm";
import type { MySql2Database, MySqlDatabase } from "drizzle-orm/mysql2";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { migrations } from "./migrations";
import { migrations as migrationsTable } from "./schema";
export async function migrate(
	db: MySqlDatabase<any, any> | PlanetScaleDatabase<any> | MySql2Database<any>,
) {
	const step = await db
		.select()
		.from(migrationsTable)
		.orderBy(desc(migrationsTable.id))
		.limit(1)
		.then((res) => res?.[0]?.id ?? 0)
		.catch(() => 0);

	for (const migration of migrations.slice(step)) {
		db.transaction(async (tx) => {
			await tx.execute(migration);
			await tx.insert(migrationsTable).values({ created_at: new Date() });
		});
	}
}
