import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { RunInput } from "./run";

type ValueStrings<T> = T[keyof T] extends readonly (infer U)[] ? U : string;

export interface Job<
	T extends StandardSchemaV1 = any,
	Id extends string = string,
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
	run(opts: RunInput<StandardSchemaV1.InferInput<T>>): Promise<void>;
	/**
	 * Schema of the data
	 */
	schema: T;
	// retries?: {
	// 	/**
	// 	 * Max amount of retries
	// 	 * @default 0
	// 	 */
	// 	amount?: number;
	// 	/**
	// 	 * Defaults to exponential backoff
	// 	 * @param attempt (the current attempt, starts at 0)
	// 	 * @returns delay
	// 	 */
	// 	delayFn?(attempt: number): number;
	// };

	hooks?: {
		beforeRun?(opts: RunInput<StandardSchemaV1.InferInput<T>>): Promise<void>;
		afterRun?(opts: RunInput<StandardSchemaV1.InferInput<T>>): Promise<void>;
		// beforeStep?(opts: RunInput<StandardSchemaV1.InferInput<T>>): Promise<void>;
		// afterStep?(opts: RunInput<StandardSchemaV1.InferInput<T>>): Promise<void>;
	};
}

export const job = <T extends StandardSchemaV1, Id extends string>({
	id,
	run,
	schema,
}: Job<T, Id>) => {
	if (!id || id.length === 0) {
		throw new Error(`Job ID must be a non-empty string`);
	}
	if (id.length > 255) {
		throw new Error(`Job ID must be less than 255 characters`);
	}
	return {
		id,
		run: async ({ ctx }: RunInput<T>) => {
			let result = schema["~standard"].validate(ctx.data);
			if (result instanceof Promise) result = await result;

			// if the `issues` field exists, the validation failed
			if (result.issues) {
				throw new Error(JSON.stringify(result.issues, null, 2));
			}
			return run({ ctx });
		},
		schema,
	};
};
