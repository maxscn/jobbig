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
	.use(EventPlugin({
		events: [{
			type: "user.updated",
			schema: z.object({
				id: z.string(),
				email: z.email(),
				name: z.string().min(2).max(100),
			})
		} as const]
	}))
	.use(ServerPlugin())
	// Define a job
	.handle({
		id: "job5",
		run: async ({ ctx }) => {
			await ctx.sleep(10000 * Math.random());
			ctx.schedule({
				jobId: "job3",
				data: { max: 10 }
			})
		},
		schema: z.object({
			min: z.number().min(0).max(100),
		}),
	})
	// Define an event
	.event({
		type: "user.created",
		schema: z.object({
			x: z.string(),
			email: z.email(),
			name: z.string().min(2).max(100),
		}),
	})
	.event({
		type: "user.deleted",
		schema: z.object({
			x: z.string(),
			email: z.email(),
			name: z.string().min(2).max(100),
		}),
	})
	// Define a handler for an event
	.on({
		types: ["user.created", "user.updated"],
		handler: async ({ ctx }) => {
			if (ctx.id === "user.updated") {
				console.log(ctx.data.email)
			}
			console.log("Handling user.created and user.updated event: " + ctx.id);
		},
	})
		.on({
		types: ["user.created"],
		handler: async ({ ctx }) => {
			console.log("Handling user.created event: " + ctx.id);
		},
	})
	.on({
		types: ["user.deleted"],
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

// Only available to events
jobbig.publish({
	type: "user.created",
	payload: {
		x: "test",
		email: "test@test.se",
		name: "Test User",
	},
});

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
