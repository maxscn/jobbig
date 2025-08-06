import { mysqlTable } from "drizzle-orm/mysql-core";

export const migrations = mysqlTable("jobbig_migrations", (table) => ({
	id: table.int("id").notNull().primaryKey().autoincrement(),
	created_at: table.timestamp("created_at").defaultNow(),
}));

export const runs = mysqlTable("jobbig_runs", (table) => ({
	id: table.varchar("id", { length: 26 }).primaryKey(),
	jobId: table.varchar("job_id", { length: 255 }).notNull(),
	scheduledAt: table.timestamp("scheduled_at").notNull().defaultNow(),
	status: table
		.varchar("status", {
			length: 32,
			enum: ["pending", "running", "success", "failure"],
		})
		.notNull()
		.default("pending"),
	data: table.json("data"),
	metadata: table.json("metadata"),
	result: table.json("result"),
	attempt: table.int("retry").default(0),
	currentStep: table.int("current_step").notNull().default(0),
	startedAt: table.timestamp("started_at"),
	createdAt: table.timestamp("created_at").notNull().defaultNow(),
	finishedAt: table.timestamp("finished_at"),
}));
