import type { StandardSchemaV1 } from "@standard-schema/spec";
import { type JobType } from "../job";
import type { JobbigInstance, JobsFromArray, UpdatePluginsInInstance } from "../jobbig";
import type { RunInput } from "../run";

interface EventOpts<T extends Event[]> {
	events?: T;
}

export interface Event<T extends StandardSchemaV1 = any, Id extends string = string> {
	type: Id;
	schema: T;
}

// New helper type to get the union of schemas for multiple types from available events
type SchemaForTypes<Events extends Event[], Types extends string[]> = {
	[K in keyof Types]: Types[K] extends Events[number]["type"]
	? SchemaForType<Events[number], Types[K]>
	: never;
}[number];

export interface EventListener<I extends JobbigInstance<any, any, any>, Events extends Event[], Types extends string[]> {
	types: Types;
	handler: (opts: EventHandlerUnion<I, Events, Types>) => Promise<void>
}

type EventHandlerUnion<I extends JobbigInstance<any, any, any>, Events extends Event[], Types extends string[]> = {
	[K in keyof Types]: Types[K] extends Events[number]["type"] 
		? RunInput<
			StandardSchemaV1.InferInput<SchemaForType<Events[number], Types[K]>>,
			Types[K],
			I
		>
		: never
}[number];
type EventsFromArray<T extends Event[]> = T[number];

type SchemaForType<E extends Event, Type extends E["type"]> = Extract<
	E,
	{ type: Type }
>["schema"];

// Simplified plugin return type
type EventPluginReturn<
	Events extends Event<any, any>[],
> = {
	publish: <Type extends Events[number]["type"] & string = Events[number]["type"] | (string & {}) >(
		event: {
			type: Type;
			payload: StandardSchemaV1.InferInput<SchemaForType<EventsFromArray<Events>, Type>>;
		},
	) => Promise<void>;
	on<
		I extends JobbigInstance<any, any, any>,
		const Types extends string[],
	>(
		this: I,
		event: EventListener<I, Events, Types>
		): I
	event<
		I extends JobbigInstance<any, any, any>,
		const NewSchema extends StandardSchemaV1,
		const NewType extends string,
	>(
		this: I,
		event: Event<NewSchema, NewType>
	): UpdatePluginsInInstance<Omit<I, "event" | "on" | "publish">, EventPluginReturn<[...Events, Event<NewSchema, NewType>]>>;
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
		return {
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
			event<
				I extends JobbigInstance<any, any, any>,
				const NewSchema extends StandardSchemaV1,
				const NewType extends string,
			>(
				this: I,
				event: Event<NewSchema, NewType>
			): UpdatePluginsInInstance<Omit<I, "event" | "on" | "publish">, EventPluginReturn<[...Events, Event<NewSchema, NewType>]>> {
				const newEvent = {
					type: event.type,
					schema: event.schema,
				};

				const updatedPlugin = EventPlugin({
					events: [...events, newEvent]
				});
				return this.use(updatedPlugin) as UpdatePluginsInInstance<Omit<I, "event" | "on" | "publish">, EventPluginReturn<[...Events, Event<NewSchema, NewType>]>>;
			},
			on<
				I extends JobbigInstance<any, any, any>,
				const Types extends string[]
			>(
				this: I,
				listener: EventListener<I, Events, Types>
			): I {
				let instance: I = this;
				for (const type of listener.types) {
					const matchedEvent = events.find(e => e.type === type); 
					if (!matchedEvent) throw new Error("No matched event found")
					const job = {
						id: type,
						schema: matchedEvent.schema,
						run: listener.handler
					}
					instance = instance.handle(job) as unknown as I
				}
				// Apply the updated plugin to the instance
				return instance as I;
			}
		} 
	};
}

