import type { Publisher } from "./publisher";
import { Run, type RunData, type RunOpts } from "./run";
import type { Prettify } from "./utils/prettify";

type RunOrFn =
	| RunData
	| ((fn: (opts: Prettify<Omit<RunOpts, "metadata">>) => RunData) => RunData);

interface JobbigOpts {
	metadata?: unknown;
	publisher: Publisher;
}

export function jobbig(opts: JobbigOpts) {
	const { publisher, metadata } = opts;
	return {
		async publish(runOrFn: RunOrFn) {
			const isFn = typeof runOrFn === "function";
			const run = isFn
				? runOrFn((data) => Run({ ...data, metadata }))
				: runOrFn;
			return publisher.publish(run);
		},
		create: Run,
	};
}
