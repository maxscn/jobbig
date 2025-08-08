import type { JobbigInstance } from "../jobbig";
import { CronWorker } from "../workers/cron";

export function NextjsCronPlugin() {
	return (instance: JobbigInstance<any, any, any>) => ({
		serve: () => ({
			GET: (request: Request) => {
				const authHeader = request.headers.get('authorization');
				if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
					return new Response('Unauthorized', {
						status: 401,
					});
				}
				return CronWorker({ jobbig: instance }).start();
			}
			})
	});
}
