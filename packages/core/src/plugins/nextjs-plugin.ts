import type { JobbigInstance } from "../jobbig";
import { CronWorker } from "../workers/cron";

export function NextjsCronPlugin() {
	return (instance: JobbigInstance) => ({
		serve: () => ({
			GET: (request: Request) => CronWorker({ jobbig: instance }),
		}),
	});
}
