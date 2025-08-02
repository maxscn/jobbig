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
			do {
				const info = await poll();
				exhausted = info.exhausted;
			} while (!exhausted);
		},
	};
}
