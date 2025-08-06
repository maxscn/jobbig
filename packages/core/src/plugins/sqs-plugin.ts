import type { SQSEvent } from "aws-lambda";
import type { JobbigInstance } from "../jobbig";
import { SQS, SQSWorker } from "../sqs";

interface SQSPluginProps {
	queueUrl: string;
}
export function SQSPlugin({ queueUrl }: SQSPluginProps) {
	return (instance: JobbigInstance) => ({
		handler: (payload: SQSEvent) =>
			SQSWorker({ jobbig: instance, payload }).start(),
		cron: () => SQS({ queueUrl, store: instance.store }),
	});
}
