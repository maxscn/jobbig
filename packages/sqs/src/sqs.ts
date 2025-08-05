import type { Queue } from "@jobbig/core";
import { client } from "./aws";

const MAX_DELAY_SECONDS = 900;

interface SQSOpts {
	/**
	 * Queue url for SQS queue.
	 */
	queueUrl: string;
	/**
	 * The SQS implementation requires a backing seperate queue to support delayed messages.
	 * This queue is skipped if the scheduled date is within 15 minutes of the current time, as that is the maximum delay supported by SQS.
	 *
	 */
	queue: Queue;
}
export function SQS({ queueUrl, queue }: SQSOpts): Queue {
	async function sendMessage(payload: any) {
		const aws = await client();
		const res = await aws.fetch(`https://sqs.${aws.region}.amazonaws.com`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-amz-json-1.0",
				"X-Amz-Target": `AmazonSQS.SendMessage`,
			},
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			throw new Error(
				`Failed to send message: ${res.status} ${await res.text()}`,
			);
		}
		const json = await res.json();
		console.log("SQS Response:", json);
	}

	return {
		async poll(amount) {
			const { runs, info } = await queue.poll(amount);
			for (const run of runs) {
				await this.push(run);
			}
			return { runs, info };
		},
		async push(run) {
			const timestamp = Math.floor(Date.now() / 1000);
			const delaySeconds = Math.max(
				0,
				run.scheduledAt.getTime() / 1000 - timestamp,
			);
			if (delaySeconds > MAX_DELAY_SECONDS) {
				await queue.push(run);
			} else {
				const messageBody = JSON.stringify(run);
				await sendMessage({
					MessageBody: messageBody,
					DelaySeconds: delaySeconds,
					QueueUrl: queueUrl,
				});
			}
		},
	};
}
