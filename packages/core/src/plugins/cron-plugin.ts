import type { JobbigInstance } from "../jobbig";
import { CronWorker } from "../workers/cron";

export function CronPlugin() {
	return (instance: JobbigInstance) => ({
		cron: CronWorker({ jobbig: instance }),
	});
}
