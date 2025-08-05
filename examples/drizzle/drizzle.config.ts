import { defineConfig } from "drizzle-kit";

export default defineConfig({
	strict: true,
	verbose: true,
	dialect: "mysql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
