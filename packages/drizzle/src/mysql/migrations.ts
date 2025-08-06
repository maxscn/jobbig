import { sql } from "drizzle-orm";

export const migrations = [
	sql`CREATE TABLE jobbig_migrations (
		id int AUTO_INCREMENT NOT NULL,
		created_at timestamp DEFAULT (now()),
		CONSTRAINT jobbig_migrations_id PRIMARY KEY(id)
);`,
	sql`CREATE TABLE jobbig_runs (
		id varchar(26) NOT NULL,
		job_id varchar(255) NOT NULL,
		scheduled_at timestamp NOT NULL DEFAULT (now()),
		status varchar(32) NOT NULL DEFAULT 'pending',
		data json,
		metadata json,
		result json,
		retry int DEFAULT 0,
		current_step int NOT NULL DEFAULT 0,
		started_at timestamp,
		created_at timestamp NOT NULL DEFAULT (now()),
		finished_at timestamp,
		attempt int DEFAULT 0,
		CONSTRAINT jobbig_runs_id PRIMARY KEY(id)
);
`,
];
