import type { JobbigInstance } from "../jobbig";
import { ContinuousWorker } from "../workers/server";

export function ServerPlugin(instance: JobbigInstance) {
	return {
		server: () => ContinuousWorker({ jobbig: instance }),
	};
}
