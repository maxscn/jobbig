import { Job, Jobbig } from "@jobbig/core";
import { EventPlugin, ServerPlugin, SQSPlugin } from "@jobbig/core/plugins";
import { LocalStore } from "@jobbig/local";
import { z } from "zod";

const store = LocalStore({});

// Instansiate store and provide the job registry
const jobbig = Jobbig({
	store,
	jobs: [
		Job({
			id: "job3",
			run: async ({ ctx }) => {
				await ctx.sleep(10000 * Math.random());
			},
			schema: z.object({
				max: z.number().min(0).max(100),
			}),
		}),
	],
})
	.use(EventPlugin())
	.use(ServerPlugin())
	// Define a job
	.handle({
		id: "job5",
		run: async ({ ctx }) => {
			await ctx.sleep(10000 * Math.random());
			ctx.schedule({
				jobId: "job3",
				data: { max: 10}
			})
		},
		schema: z.object({
			min: z.number().min(0).max(100),
		}),
	})
	// Define a job as an event
	.on({
		type: "user.updated",
		schema: z.object({
			id: z.string(),
			email: z.email(),
			name: z.string().min(2).max(100),
		}),
		handler: async ({ ctx }) => {
			ctx.schedule({
				jobId: "job3",
				data: { max: 10 },
			});
			console.log("Handling user.updated event:", ctx);
		},
	})
	.on({
		type: "user.created",
		schema: z.object({
			x: z.string(),
			email: z.email(),
			name: z.string().min(2).max(100),
		}),
		handler: async ({ ctx }) => {
			console.log("Handling user.created event:", ctx);
		},
	})
	.on({
		type: "user.deleted",
		schema: z.object({
			x: z.string(),
			email: z.email(),
			name: z.string().min(2).max(100),
		}),
		handler: async ({ ctx }) => {
			ctx.schedule({
				jobId: "job3"
			})
			console.log("Handling user.deleted event:", ctx);
		},
	})
	.handle({
		id: "job7",
		run: async ({ ctx }) => { 
			await ctx.sleep(10000 * Math.random());
		},
		schema: z.object({
			min: z.number().min(0).max(100),
		}),
	})
		.use(SQSPlugin({ queueUrl: "test" }))

const test = jobbig.types
// Only available to events
jobbig.publish({
	type: "user.updated",
	payload: {
		id: "test",
		email: "test@test.se",
		name: "Test User",
	},
});

// Only relates to jobs
jobbig.schedule({
	jobId: "job7",
	data: { min: 5 },
});


// Polls for jobs and runs them
await jobbig.server();
console.log("server finished");
