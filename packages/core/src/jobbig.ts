import { Run, type RunData, type RunOpts } from "./run";
import type { Scheduler } from "./scheduler";
import type { Prettify } from "./utils/prettify";

type RunOrFn =
	| RunData
	| ((fn: (opts: Prettify<Omit<RunOpts, "metadata">>) => RunData) => RunData);

interface JobbigOpts {
	metadata?: unknown;
	scheduler: Scheduler;
}

export function jobbig(opts: JobbigOpts) {
	const { scheduler, metadata } = opts;
	return {
		async schedule(runOrFn: RunOrFn) {
			const isFn = typeof runOrFn === "function";
			const run = isFn
				? runOrFn((data) => Run({ ...data, metadata }))
				: runOrFn;
			return scheduler.schedule(run);
		},
		create: Run,
	};
}
