import type { SQSEvent } from "aws-lambda";
import type { JobbigInstance } from "../jobbig";
import { SQS, SQSWorker } from "../sqs";

interface SQSPluginProps {
	queueUrl: string;
	pollAmount?: number;
}
export function SQSPlugin({ pollAmount = 100 }: SQSPluginProps) {
	return (instance: JobbigInstance) => ({
		handler: (payload: SQSEvent) => {
			return SQSWorker({ jobbig: instance, payload }).start();
		},
		cron: () => {
			return instance.store.poll(pollAmount);
		},
	});
}
