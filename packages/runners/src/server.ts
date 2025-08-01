import { type OrchestratorOpts, orchestrator } from "@jobbig/core";

const POLL_INTERVAL = 1000;

export const server = async (opts: OrchestratorOpts) => {
	const poll = orchestrator(opts);
	while (true) {
    const start = Date.now();
		await poll();
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL - (Date.now() - start)));
	}
};
