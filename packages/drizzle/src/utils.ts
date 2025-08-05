import type { SslOptions } from "mysql2";

export type DBCredentials =
	| {
			host: string;
			port?: number;
			user?: string;
			password?: string;
			database: string;
			ssl?: string | SslOptions;
	  }
	| {
			url: string;
	  };

const hasUrl = (credentials: DBCredentials): credentials is { url: string } =>
	"url" in credentials;

export const resolveUrl = (credentials: DBCredentials) => {
	if (hasUrl(credentials)) return credentials.url;
	const { host, port, user, password, database, ssl } = credentials;
	return `mysql://${user}:${password}@${host}:${port}/${database}?ssl=${ssl}`;
};
