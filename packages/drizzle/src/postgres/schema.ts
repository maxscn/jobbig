import { pgTable } from "drizzle-orm/pg-core";

export const migrations = pgTable("jobbig_migrations", (table) => ({
	id: table.serial("id").notNull().primaryKey(),
	created_at: table.timestamp("created_at").defaultNow(),
}));

export const runs = pgTable("jobbig_runs", (table) => ({
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
	data: table.jsonb("data"),
	metadata: table.jsonb("metadata"),
	result: table.jsonb("result"),
	attempt: table.integer("retry").default(0),
	currentStep: table.integer("current_step").notNull().default(0),
	startedAt: table.timestamp("started_at"),
	createdAt: table.timestamp("created_at").notNull().defaultNow(),
	finishedAt: table.timestamp("finished_at"),
}));
