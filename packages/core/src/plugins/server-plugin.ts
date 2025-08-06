import type { JobbigInstance } from "../jobbig";
import { ContinuousWorker } from "../workers/server";

export function ServerPlugin() {
	return (instance: JobbigInstance) => ({
		server: () => ContinuousWorker({ jobbig: instance }),
	});
}
