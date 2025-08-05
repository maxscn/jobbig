import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Job } from "./job";
import { Run, type RunOpts } from "./run";
import type { Scheduler } from "./scheduler";

type JobsFromArray<T extends readonly Job[]> = T[number];

interface JobbigOpts<Metadata> {
	metadata?: Metadata;
	scheduler: Scheduler;
}

type SchemaForId<J extends Job, Id extends J["id"]> = Extract<
	J,
	{ id: Id }
>["schema"];

export function jobbig<
	T extends readonly Job[] = any,
	Metadata = unknown,
	J extends Job = JobsFromArray<T>,
	Id extends J["id"] = J["id"],
>(opts: JobbigOpts<Metadata>) {
	const { scheduler, metadata } = opts;
	return {
		async schedule<SpecificId extends Id>(
			run: Omit<
				RunOpts<
					SpecificId,
					StandardSchemaV1.InferInput<SchemaForId<J, SpecificId>>
				>,
				"metadata"
			>,
		) {
			return scheduler.schedule(Run({ ...run, metadata }));
		},
		create: Run,
	};
}
