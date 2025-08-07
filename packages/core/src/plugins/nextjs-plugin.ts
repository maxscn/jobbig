import type { JobbigInstance } from "../jobbig";
import { CronWorker } from "../workers/cron";

export function NextjsCronPlugin() {
	return (instance: JobbigInstance<any, any, any>) => ({
		serve: () => ({
			GET: () => CronWorker({ jobbig: instance }),
		}),
	});
}
