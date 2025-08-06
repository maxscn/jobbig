import { sql } from "drizzle-orm";

export const migrations = [
	sql`CREATE TABLE "jobbig_migrations" (
		"id" serial PRIMARY KEY NOT NULL,
		"created_at" timestamp DEFAULT now()
);`,
	sql`CREATE TABLE "jobbig_runs" (
		"id" varchar(26) PRIMARY KEY NOT NULL,
		"job_id" varchar(255) NOT NULL,
		"scheduled_at" timestamp DEFAULT now() NOT NULL,
		"status" varchar(32) DEFAULT 'pending' NOT NULL,
		"data" jsonb,
		"metadata" jsonb,
		"result" jsonb,
		"attempt" integer DEFAULT 0,
		"current_step" integer DEFAULT 0 NOT NULL,
		"started_at" timestamp,
		"created_at" timestamp DEFAULT now() NOT NULL,
		"finished_at" timestamp
);`,
];
