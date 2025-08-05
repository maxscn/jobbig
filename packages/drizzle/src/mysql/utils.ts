import type { DrizzleConfig } from "drizzle-orm";
import type { MySql2DrizzleConfig } from "drizzle-orm/mysql2";
import type { DBCredentials } from "../utils";
export type ExtendedMySql2DrizzleConfig = MySql2DrizzleConfig & {
	dialect: "mysql";
	dbCredentials: DBCredentials;
};
export const isMySQLConfig = (
	config: DrizzleConfig,
): config is ExtendedMySql2DrizzleConfig => {
	return "dialect" in config && config.dialect === "mysql";
};
