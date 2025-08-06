import type { Store } from "@jobbig/core";
import { client } from "./aws";

const MAX_DELAY_SECONDS = 900;

interface SQSOpts {
	/**
	 * Queue url for SQS queue.
	 */
	queueUrl: string;
	/**
	 * The SQS implementation requires a backing seperate queue to support delayed messages and additional functionality for updating and storing messages.
	 *
	 */
	store: Store;
}
export function SQS({ queueUrl, store }: SQSOpts): Store {
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
			const { runs, info } = await store.poll(amount);
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
			await store.push(run);
			if (delaySeconds <= MAX_DELAY_SECONDS) {
				const messageBody = JSON.stringify(run);
				await sendMessage({
					MessageBody: messageBody,
					DelaySeconds: delaySeconds,
					QueueUrl: queueUrl,
				});
			}
		},
		set: store.set,
		get: store.get,
		fetch: store.fetch,
		lock: store.lock,
		unlock: store.unlock,
		isLocked: store.isLocked,
	};
}
