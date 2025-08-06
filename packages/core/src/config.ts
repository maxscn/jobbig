import type { Store } from "./store";

export interface Config {
	store: Store;
}

/**
 * Config for the development server which connects to https://local.jobbig.dev
 * @param config
 * @returns
 */
export function defineConfig(config: Config): Config {
	return config;
}
