import { Jobbig } from "@jobbig/core";
import {
	CronPlugin,
	EventPlugin,
	ServerPlugin,
	SQSPlugin,
} from "@jobbig/core/plugins";
import { LocalStore } from "@jobbig/local";
import { z } from "zod";

const store = LocalStore({});

// Instansiate store and provide the job registry
const jobbig = Jobbig({
	store,
})
	.use(ServerPlugin())
	.use(SQSPlugin({ queueUrl: "test" }))
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
	})
	.handle({
		id: "job3",
		run: async ({ ctx }) => {
			await ctx.sleep(10000 * Math.random());
		},
		schema: z.undefined(),
	})
	.handle({
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

jobbig.publish({
	type: "user.created",
	payload: {
		id: "123",
		email: "test@example.com",
		name: "John Doe",
	},
});
jobbig.publish({
	type: "user.created",
	payload: {
		id: "456",
		email: "test2@example.com",
		name: "Jane Doe",
	},
});
jobbig.schedule({
	jobId: "job3",
});

// Polls for jobs and runs them
jobbig.server();
console.log("server finished");
