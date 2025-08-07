import { Jobbig } from "@jobbig/core";
import { EventPlugin, ServerPlugin, SQSPlugin } from "@jobbig/core/plugins";
import { LocalStore } from "@jobbig/local";
import { z } from "zod";

const store = LocalStore({});

// Instansiate store and provide the job registry
const jobbig = Jobbig({
	store,
})
	.use(EventPlugin())
	.use(ServerPlugin())
	.use(SQSPlugin({ queueUrl: "test" }))
	// Define a job 
	.handle({
		id: "job3",
		run: async ({ ctx }) => {
			await ctx.sleep(10000 * Math.random());
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
			console.log("Handling user.updated event:", ctx);
		},
	});

// Only available to events
jobbig.publish({
	type: "user.updated",
	payload: {
		id: "123",
		email: "test@example.com",
		name: "John Doe",
	},
});

// Only relates to jobs
jobbig.schedule({
	jobId: "ajob3",
	data: undefined
});

// Polls for jobs and runs them
await jobbig.server();
console.log("server finished");
