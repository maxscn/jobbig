import {
	BaseOrchestrator,
	type OrchestratorOpts,
	type Worker,
} from "@jobbig/core";

const DEFAULT_POLL_INTERVAL = 1000;

export const ContinousWorker = (
	opts: OrchestratorOpts & { pollInterval?: number },
): Worker => {
	const poll = BaseOrchestrator(opts);
	const interval = opts.pollInterval || DEFAULT_POLL_INTERVAL;
	return {
		async start() {
			while (true) {
				const start = Date.now();
				await poll();
				await new Promise((resolve) =>
					setTimeout(resolve, interval - (Date.now() - start)),
				);
			}
		},
	};
};
