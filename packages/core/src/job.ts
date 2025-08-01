import type { StandardSchemaV1 } from "@standard-schema/spec";
import type {  RunInput } from "./run";


export interface Job<T extends StandardSchemaV1> {
	id: string;
	run: ({ ctx }: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
	schema: T;
}

export const job = <T extends StandardSchemaV1>({ id, run, schema }: Job<T>) => {
  return {
    id,
    run: async ({ ctx }: RunInput<T>) => {
      let result = schema['~standard'].validate(ctx.data);
      if (result instanceof Promise) result = await result;

      // if the `issues` field exists, the validation failed
      if (result.issues) {
        throw new Error(JSON.stringify(result.issues, null, 2));
      }
      return run({ ctx });
    },
    schema
  }
}
