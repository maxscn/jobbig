import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type JobType } from "../job";
import type { JobbigInstance, JobsFromArray, UpdatePluginsInInstance } from "../jobbig";
import type { RunInput } from "../run";

interface EventOpts<T extends Event[]> {
	events?: T;
}

export interface Event<T extends StandardSchemaV1 = any, Id extends string = string, I extends JobbigInstance<any, any, any> = JobbigInstance<any, any, any>> {
	type: Id;
	schema: T;
	handler: (input: RunInput<StandardSchemaV1.InferInput<T>, I>) => Promise<void>;
}

type EventsFromArray<T extends Event[]> = T[number];

type SchemaForType<E extends Event, Type extends E["type"]> = Extract<
	E,
	{ type: Type }
>["schema"];

// Simplified plugin return type
type EventPluginReturn<
	Events extends Event<any, any, any>[],
> = {
	publish: <Type extends Events[number]["type"] & string = Events[number]["type"] | (string & {}) >(
		event: {
			type: Type;
			payload: StandardSchemaV1.InferInput<SchemaForType<EventsFromArray<Events>, Type>>;
		},
	) => Promise<void>;
	on<
		I extends JobbigInstance<any, any, any>,
		const NewSchema extends StandardSchemaV1,
		const NewType extends string,
	>(
		this: I,
		event: Event<NewSchema, NewType, I>
	): UpdatePluginsInInstance<Omit<I, "on" | "publish">, EventPluginReturn<[...Events, Event<NewSchema, NewType, I>]>>;
	types: Events[number]["type"][][number]
};

export function EventPlugin<Events extends Event[] = []>(
	opts?: EventOpts<Events>,
) {
	const { events = [] } = opts ?? {};

	return <
		JobTypes extends JobType[] = JobType[],
		Metadata = unknown,
		Plugins extends Record<string, any> = {},
	>(
		instance: JobbigInstance<JobTypes, Metadata, Plugins>,
	): EventPluginReturn<Events> => {
		const pluginMethods = {
			publish: async <
				Type extends Events[number]["type"] & string = Events[number]["type"] | (string & {}),
			>(event: {
				type: Type;
				payload: any;
			}) => {
				const matchedEvent = events.find((e) => e.type === event.type);
				if (!matchedEvent) throw new Error(`Event ${event.type} not found`);

				let result = matchedEvent.schema["~standard"].validate(event.payload);
				if (result instanceof Promise) result = await result;

				if (result.issues) {
					throw new Error(JSON.stringify(result.issues, null, 2));
				}

				await instance.schedule({
					jobId: event.type,
					data: event.payload,
				});
			},
			on<
				I extends JobbigInstance<any, any, any>,
				const NewSchema extends StandardSchemaV1,
				const NewType extends string,
			>(
				this: I,
				event: {
					type: NewType;
					schema: NewSchema;
					handler: (
						opts: RunInput<StandardSchemaV1.InferInput<NewSchema>, I>,
					) => Promise<void>;
				}
			): UpdatePluginsInInstance<Omit<I, "on" | "publish">, EventPluginReturn<[...Events, Event<NewSchema, NewType, I>]>> {
				const job = {
					id: event.type,
					schema: event.schema,
					run: event.handler,
				};
				// Create a new event from the input
				const newEvent: Event<NewSchema, NewType, I> = {
					type: event.type,
					schema: event.schema,
					handler: event.handler,
				};

				// Create a new plugin with the updated events array
				const updatedPlugin = EventPlugin({
					events: [...events, newEvent] as [
						...Events,
						Event<NewSchema, NewType>,
					],
				});
				// Apply the updated plugin to the instance
				return this.use(updatedPlugin).handle(job) as UpdatePluginsInInstance<Omit<I, "on" | "publish">, EventPluginReturn<[...Events, Event<NewSchema, NewType, I>]>>;
			}
		};

		return pluginMethods as EventPluginReturn<Events>;
	};
}


export const Event = <const T extends StandardSchemaV1, const Id extends string, I extends JobbigInstance<any, any, any> = JobbigInstance<any, any, any>>({
	type,
	handler,
	schema
}: Readonly<Event<T, Id, I>>) => {
	if (!type || type.length === 0) {
		throw new Error(`Job ID must be a non-empty string`);
	}
	if (type.length > 255) {
		throw new Error(`Job ID must be less than 255 characters`);
	}
	return {
		type,
		handler: async (opts: RunInput<T, I>) => {
			let result = schema["~standard"].validate(opts.ctx.data);
			if (result instanceof Promise) result = await result;

			// if the `issues` field exists, the validation failed
			if (result.issues) {
				throw new Error(JSON.stringify(result.issues, null, 2));
			}
			return handler(opts);
		},
		schema,
	} as Event<T, Id, I>;
};
