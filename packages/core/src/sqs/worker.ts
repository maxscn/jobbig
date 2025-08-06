import type { SQSEvent } from "aws-lambda";
import { BaseRunner, type JobbigInstance, type Worker } from "../";

interface SQSWorkerOpts {
	payload: SQSEvent;
	jobbig: JobbigInstance;
}

export function SQSWorker({ jobbig, payload }: SQSWorkerOpts): Worker {
	return {
		async start() {
			const runs = await Promise.all(
				payload.Records.map((record) => JSON.parse(record.body)),
			);
			for (const run of runs) {
				const runner = BaseRunner({ run, jobbig });
				await runner.run();
			}
		},
	};
}
