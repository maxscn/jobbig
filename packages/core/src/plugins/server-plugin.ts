import type { JobbigInstance } from "../jobbig";
import { ContinuousWorker } from "../workers/server";

export function ServerPlugin() {
	return (instance: JobbigInstance<any, any, any>) => ({
		server: () => ContinuousWorker({ jobbig: instance }).start(),
	});
}
