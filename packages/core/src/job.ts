import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { RunInput } from "./run";
import type { JobbigInstance } from "./jobbig";

export interface JobType<
	T extends StandardSchemaV1 = any,
	Id extends string = string,
	I extends JobbigInstance<any, any, any> = JobbigInstance<any, any, any>,
> {
	/**
	 * Unique identifier of the jobs. Used to match handlers with runs.
	 */
	id: Id;
	/**
	 * The job runner.
	 * @param opts - The options for running the job.
	 * @returns A promise that resolves when the job is completed.
	 */
	run(opts: RunInput<StandardSchemaV1.InferInput<T>, Id, I>): Promise<void>;
	/**
	 * Schema of the data
	 */
	schema: T;

	hooks?: {
		beforeRun?(opts: RunInput<StandardSchemaV1.InferInput<T>, Id, I>): Promise<void>;
		afterRun?(opts: RunInput<StandardSchemaV1.InferInput<T>, Id, I>): Promise<void>;
		// beforeStep?(opts: RunInput<StandardSchemaV1.InferInput<T>>): Promise<void>;
		// afterStep?(opts: RunInput<StandardSchemaV1.InferInput<T>>): Promise<void>;
	};

	/**
	 * The amount of time to retry a job. Defaults to 0. The job will be rescheduled and runs again within the scheduling the delay.
	 */

	retries?: number;
}

export const Job = <const T extends StandardSchemaV1, const Id extends string, I extends JobbigInstance<any, any, any> = JobbigInstance<any, any, any>>({
	id,
	run,
	schema,
	retries = 0,}: Readonly<JobType<T, Id, I>>) => {
	if (!id || id.length === 0) {
		throw new Error(`Job ID must be a non-empty string`);
	}
	if (id.length > 255) {
		throw new Error(`Job ID must be less than 255 characters`);
	}
	return {
		id,
		run: async (opts: RunInput<T, Id, I>) => {
			let result = schema["~standard"].validate(opts.ctx.data);
			if (result instanceof Promise) result = await result;

			// if the `issues` field exists, the validation failed
			if (result.issues) {
				throw new Error(JSON.stringify(result.issues, null, 2));
			}
			return run(opts);
		},
		schema,
		retries,
	} as JobType<T, Id, I>;
};
