import type { JobbigInstance } from "../jobbig";
import { CronWorker } from "../workers/cron";

export function CronPlugin(instance: JobbigInstance) {
	return {
		cron: CronWorker({ jobbig: instance }),
	};
}
