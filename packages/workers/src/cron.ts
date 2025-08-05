import {
	BaseOrchestrator,
	type OrchestratorOpts,
	type Worker,
} from "@jobbig/core";
export function CronWorker(opts: OrchestratorOpts): Worker {
	const poll = BaseOrchestrator(opts);
	return {
		async start() {
			let exhausted: boolean;
			let running: Promise<void>[];
			do {
				const { running: rs, info } = await poll();
				exhausted = info.exhausted;
				running = rs;
			} while (!exhausted);
			await Promise.all(running);
		},
	};
}
