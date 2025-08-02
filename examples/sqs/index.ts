import { job, Publisher, type Run } from "@jobbig/core";
import { must, sleep } from "@jobbig/core/utils";
import { LocalQueue, LocalStore } from "@jobbig/local";
import { SQS, SQSWorker } from "@jobbig/sqs";
import { z } from "zod";

const runs: Run[] = [
	{
		id: "run1",
		jobId: "job1",
		currentStep: 0,
		data: {},
		scheduledAt: new Date(),
		status: "pending",
		createdAt: new Date(),
	},
	{
		id: "run2",
		jobId: "job2",
		currentStep: 0,
		data: {
			input: 1,
			output: 2,
		},
		scheduledAt: new Date(Date.now() + 5000),
		status: "pending",
		createdAt: new Date(),
	},
	{
		id: "run3",
		jobId: "job2",
		currentStep: 1,
		data: {},
		scheduledAt: new Date(Date.now() + 10000),
		status: "pending",
		createdAt: new Date(),
	},
] as const;

const queue = SQS({
	queue: LocalQueue([]),
	queueUrl: must(process.env.QUEUE_URL, "You must provide a queue URL"),
});
const store = LocalStore({});
const publisher = Publisher({
	queue,
	store,
});

const jobs = [
	job({
		id: "job1",
		run: async () => {
			console.log("Running job 1...");
			await sleep(1000);
			console.log("Job 1 completed.");
		},
		schema: z.object(),
	}),
	job({
		id: "job2",
		run: async ({ ctx }) => {
			console.log("Running job 2...");
			await ctx.step.run("step1", async () => {
				console.log("Running step 1...");
				await sleep(1000);
				console.log("Step 1 completed.");
			});
			await ctx.step.run("step2", async () => {
				console.log("Running step 2...");
				await sleep(1000);
				console.log("Step 2 completed.");
			});
			await sleep(1000);
			console.log("Job 2 completed.");
		},
		schema: z.object({
			input: z.number().min(1).max(100).optional(),
			output: z.number().min(1).max(100).optional(),
		}),
	}),
];

// Run this code in a lambda or whatever is connected to your queue
// import { SQSWorker } from "@jobbig/sqs";
// const worker = SQSWorker({
// 	payload: /* the sqs payload, you get this from the lambda handler */,
// 	store,
// 	jobs
// });
// worker.start();

for (const run of runs) {
	await publisher.publish(run);
}
