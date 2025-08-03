import { command, run } from "@drizzle-team/brocli";
import { serve } from "@hono/node-server";
import server from "./studio";

const studio = command({
	name: "studio",
	options: {},
	handler: () => {
		serve({
			fetch: server.fetch,
			port: 4987,
		});
	},
});

run([studio]); // parse shell arguments and run command
