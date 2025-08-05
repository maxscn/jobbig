import { job, jobbig, Scheduler } from "@jobbig/core";
import { sleep } from "@jobbig/core/utils";
import { LocalQueue, LocalStore } from "@jobbig/local";
import { ContinuousWorker } from "@jobbig/workers";
import { z } from "zod";

const runs = [
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

const queue = LocalQueue([]);
const store = LocalStore({});
const scheduler = Scheduler({
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
	job({
		id: "job3",
		run: async ({ ctx }) => {
			await sleep(10000 * Math.random());
		},
		schema: z.undefined(),
	}),
];

const worker = ContinuousWorker({
	queue,
	store,
	jobs: jobs,
});
worker.start();

const planner = jobbig<typeof jobs>({
	scheduler,
});
for (let i = 0; i < 1000; i++) {
	planner.schedule({
		jobId: "job3",
		data: undefined,
	});
}
