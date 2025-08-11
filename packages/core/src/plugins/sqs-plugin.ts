import type { SQSEvent } from "aws-lambda";
import type { JobbigInstance } from "../jobbig";
import { SQS, SQSWorker } from "../sqs";

interface SQSPluginProps {
	queueUrl: string;
	pollAmount?: number;
}
export function SQSPlugin({ pollAmount = 100 }: SQSPluginProps) {
	return (instance: JobbigInstance<any, any, any>) => ({
		handler: (payload: SQSEvent) => {
			return SQSWorker({ jobbig: instance, payload }).start();
		},
		cron: async () => {
			const store = await instance.store;
			return store.poll(pollAmount);
		},
	});
}
