import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Job, type JobType } from "./job";
import { Run, type RunOpts } from "./run";
import type { Store } from "./store";

export type JobsFromArray<T extends readonly JobType[]> = T[number];

interface JobbigOpts<J extends JobType, Metadata> {
	readonly jobs?: readonly J[];
	store: Store;
	metadata?: Metadata;
}

type SchemaForId<J extends JobType, Id extends J["id"]> = Extract<
	J,
	{ id: Id }
>["schema"];

type Plugin<NewPlugins, T, Metadata, J, Id, Plugins> = (
	instance: JobbigInstance<T, Metadata, J, Id, Plugins>,
) => NewPlugins;

export function Jobbig<
	T extends readonly JobType[],
	Metadata = unknown,
	J extends JobType = JobsFromArray<T>,
	Id extends J["id"] = J["id"],
	Plugins extends Record<string, any> = {},
>(opts: JobbigOpts<J, Metadata>): JobbigInstance<T, Metadata, J, Id, Plugins> {
	const { store, jobs = [], metadata } = opts;
	const plugins: Plugin<Record<string, any>, T, Metadata, J, Id, Plugins>[] =
		[];

	const baseInstance = {
		async schedule<SpecificId extends Id>(
			run: Omit<
				RunOpts<
					SpecificId,
					StandardSchemaV1.InferInput<SchemaForId<J, SpecificId>>
				>,
				"metadata"
			>,
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
		get jobs(): readonly J[] {
			return jobs;
		},
		create: Run,
		use<NewPlugins extends Record<string, any>>(
			plugin: (
				instance: JobbigInstance<T, Metadata, J, Id, Plugins>,
			) => NewPlugins,
		): JobbigInstance<T, Metadata, J, Id, Plugins & NewPlugins> {
			plugins.push(plugin);
			const newMethods = plugin(this as any);
			return Object.assign({}, this, newMethods) as any;
		},
		handle<
			TSchema extends StandardSchemaV1,
			Id extends string,
			const NewJob extends JobType<TSchema, Id>,
		>(
			job: NewJob,
		): JobbigInstance<
			[...T, NewJob],
			Metadata,
			J | NewJob,
			Id | NewJob["id"],
			Plugins
		> {
			const newJobs = [...jobs, Job(job) as NewJob] as const;
			let instance = Jobbig({
				jobs: newJobs,
				store,
				metadata,
			});
			for (const plugin of plugins) {
				instance = instance.use(plugin);
			}
			return instance;
		},
	};

	return baseInstance as JobbigInstance<T, Metadata, J, Id, Plugins>;
}

// Type definition for the Jobbig instance
export type JobbigInstance<
	T extends readonly JobType[] = any,
	Metadata = unknown,
	J extends JobType = JobsFromArray<T>,
	Id extends J["id"] = J["id"],
	Plugins extends Record<string, any> = {},
> = {
	schedule<SpecificId extends Id>(
		run: Omit<
			RunOpts<
				SpecificId,
				StandardSchemaV1.InferInput<SchemaForId<J, SpecificId>>
			>,
			"metadata"
		>,
	): Promise<any>;

	create: typeof Run;
	get jobs(): J[];
	get store(): Store;
	use<NewPlugins extends Record<string, any>>(
		plugin: Plugin<NewPlugins, T, Metadata, J, Id, Plugins>,
	): JobbigInstance<T, Metadata, J, Id, Plugins & NewPlugins>;
	handle<const NewJob extends JobType>(
		job: NewJob,
	): JobbigInstance<
		readonly [...T, NewJob],
		Metadata,
		J | NewJob,
		Id | NewJob["id"],
		Plugins
	>;
} & Plugins;
