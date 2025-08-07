import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Job, type JobType } from "./job";
import { Run, type RunInput, type RunOpts } from "./run";
import type { Store } from "./store";

export type JobsFromArray<T extends readonly JobType[]> = T[number];

interface JobbigOpts<T extends Readonly<JobType<any, any>>[], Metadata, Plugins extends Record<string, any>> {
	jobs?: T;
	store: Store;
	metadata?: Metadata;
	plugins?: Plugins;
}

type SchemaForId<J extends JobType, Id extends J["id"]> = Extract<
	J,
	{ id: Id }
>["schema"];

type SchemaForIdFromArray<T extends JobType<any, any>[], Id extends JobsFromArray<T>["id"]> =
  Extract<JobsFromArray<T>, { id: Id }>["schema"];



export function Jobbig<
	T extends JobType<any, any>[],
	Metadata = unknown,
	Plugins extends Record<string, any> = {},
>(opts: JobbigOpts<T, Metadata, Plugins>): JobbigInstance<T, Metadata, Plugins> & Plugins {
	const { store,  metadata } = opts;
	const plugins: Plugins = opts.plugins ?? {} as Plugins;
	let jobs = opts.jobs ?? [] as unknown as T;

	const baseInstance = {
		async schedule<SpecificId extends JobsFromArray<T>["id"]>(
			run: RunOpts<
					SpecificId,
					StandardSchemaV1.InferInput<SchemaForId<JobsFromArray<T>["schema"], SpecificId>>
				>
		) {
			const matchedJob = jobs.find((j) => j.id === run.jobId);
			if (!matchedJob) throw new Error(`Job ${run.jobId} not found`);
			let result = matchedJob.schema["~standard"].validate(run.data);
			if (result instanceof Promise) result = await result;

			// if the `issues` field exists, the validation failed
			if (result.issues) {
				throw new Error(JSON.stringify(result.issues, null, 2));
			}

			return store.push(Run({ ...run, metadata }));
		},
		get store(): Store {
			return store;
		},
		get jobs(): T {
			return jobs;
		},
		get metadata(): Metadata | undefined {
			return metadata;
		},
		get plugins(): Plugins {
			return plugins
		},
		use<J extends JobbigInstance<any, any, any>,  NewPlugin extends Record<string, any>>(
			this: J,
			plugin: (instance: JobbigInstance<T, Metadata, Plugins>) => NewPlugin,
		): JobbigInstance<T, Metadata, Plugins & NewPlugin> {
			const newMethods = plugin(this);
			Object.assign(plugins, newMethods);
			return Object.assign(this, newMethods) as J & Plugins & NewPlugin;
		},
		handle<TSchema extends StandardSchemaV1, Id extends string>(job: JobType<TSchema, Id>): JobbigInstance<
			[...T, JobType<TSchema, Id>],
			Metadata,
			Plugins
		> {
			const j = Job({ ...job }) as Readonly<JobType<TSchema, Id>>;
			jobs = [...jobs, j] as T;
			return Jobbig.bind(this)({
				store,
				jobs,
				metadata,
				plugins,
			}) as unknown as JobbigInstance<
				[...T, JobType<TSchema, Id>],
				Metadata,
				Plugins
			> & Plugins
			
		},
	};

	// Initialize plugins
	
	return Object.assign(baseInstance, plugins) as JobbigInstance<T, Metadata, Plugins> & Plugins;
}

// Type definition for the Jobbig instance
export interface JobbigInstance<
	T extends JobType<any, any>[] = JobType<any, any>[],
	Metadata = unknown,
	Plugins extends Record<string, any> = {},
> {
	schedule: <SpecificId extends JobsFromArray<T>["id"]>(
		run: RunOpts<
    SpecificId,
    StandardSchemaV1.InferInput<SchemaForIdFromArray<T, SpecificId>>
  >
	) => Promise<void>;
	store: Store;
	jobs: T;
	metadata?: Metadata;
	plugins: Plugins;
	use<NewPlugin extends Record<string, any>>(
		plugin: (instance: JobbigInstance<T, Metadata, Plugins> & Plugins) => NewPlugin,
	): JobbigInstance<T, Metadata, Plugins & NewPlugin> & Plugins & NewPlugin;
	handle<TSchema extends StandardSchemaV1, Id extends string>(
		job: JobType<TSchema, Id>,
	): JobbigInstance<[...T, JobType<TSchema, Id>], Metadata, Plugins> & Plugins;
}


  export type MergeShapes<U, V> =
    keyof U & keyof V extends never
      ? U & V
      : {
          [k in Exclude<keyof U, keyof V>]: U[k];
        } & V;