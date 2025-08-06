import {
	EventPlugin,
	event,
	Job,
	Jobbig,
	ServerPlugin,
	sleep,
} from "@jobbig/core";
import { LocalStore } from "@jobbig/local";
import { z } from "zod";

const store = LocalStore({});

const jobs = [
	job({
		id: "job1",
		run: async ({ ctx }) => {
			console.log("Running job 1...");
			await ctx.sleep(1000);
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
				await ctx.sleep(1000);
				console.log("Step 1 completed.");
			});
			await ctx.step.run("step2", async () => {
				console.log("Running step 2...");
				await ctx.sleep(1000);
				console.log("Step 2 completed.");
			});
			await ctx.sleep(1000);
			console.log("Job 2 completed.");
		},
		schema: z.object({
			input: z.number().min(1).max(100).optional(),
			output: z.number().min(1).max(100).optional(),
		}),
	}),
	Job({
		id: "job3",
		run: async ({ ctx }) => {
			await ctx.sleep(10000 * Math.random());
		},
		schema: z.undefined(),
	}),
];

// Instansiate store and provide the job registry
const jobbig = Jobbig({
	store,
})
	.use(ServerPlugin)
	.use(EventPlugin())
	.handle({
		type: "user.created",
		schema: z.object({
			id: z.string(),
			email: z.email(),
			name: z.string().min(2).max(100),
		}),
		handler: async ({ ctx }) => {
			console.log("Handling user.created event:", ctx);
		},
	});

jobbig.publish({
	type: "user.created",
	payload: {
		id: "123",
		email: "test@example.com",
		name: "John Doe",
	},
});

// Polls for jobs and runs them
jobbig.server();
