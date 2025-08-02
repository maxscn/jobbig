import { BaseRunner, type Job, type Store, type Worker } from "@jobbig/core";
import type { SQSEvent } from "aws-lambda";

interface SQSWorkerOpts {
	payload: SQSEvent;
	store: Store;
	jobs: Job[];
}

export function SQSWorker({ store, payload, jobs }: SQSWorkerOpts): Worker {
	return {
		async start() {
			const runs = await Promise.all(
				payload.Records.map((record) => JSON.parse(record.body)).map((r) =>
					store.fetch(r.id),
				),
			);
			const filteredRuns = runs.filter((r) => r !== undefined);
			for (const run of filteredRuns) {
				const runner = BaseRunner({ run, store, jobs });
				await runner.run();
			}
		},
	};
}
