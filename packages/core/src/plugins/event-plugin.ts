import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Job, type JobType } from "../job";
import { Jobbig, type JobbigInstance, type JobsFromArray } from "../jobbig";
import type { RunInput } from "../run";

type EventData<Type extends string = string, Payload = unknown> = {
	type: Type;
	payload: Payload;
};

interface EventOpts<T extends readonly Event[]> {
	events?: T;
}

interface Event<T extends StandardSchemaV1 = any, Id extends string = string> {
	type: Id;
	schema: T;
	handler: (input: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
}

type EventsFromArray<T extends readonly Event[]> = T[number];

type SchemaForType<E extends Event, Type extends E["type"]> = Extract<
	E,
	{ type: Type }
>["schema"];

// Simplified plugin return type
type EventPluginReturn<
	Events extends readonly Event[],
	JobTypes extends readonly JobType[],
	Metadata,
	J extends JobType,
	Id extends J["id"],
	Plugins extends Record<string, any>,
> = {
	get jobs(): JobType[];
	publish: <SpecificType extends EventsFromArray<Events>["type"]>(
		event: EventData<
			SpecificType,
			StandardSchemaV1.InferInput<
				SchemaForType<EventsFromArray<Events>, SpecificType>
			>
		>,
	) => Promise<void>;
	handle<
		const NewSchema extends StandardSchemaV1,
		const NewType extends string,
	>(event: {
		type: NewType;
		schema: NewSchema;
		handler: (
			opts: RunInput<StandardSchemaV1.InferInput<NewSchema>>,
		) => Promise<void>;
	}): JobbigInstance<
		JobTypes,
		Metadata,
		J,
		Id,
		Plugins &
			EventPluginReturn<
				readonly [...Events, Event<NewSchema, NewType>],
				JobTypes,
				Metadata,
				J,
				Id,
				Plugins
			>
	>;
};

export function EventPlugin<Events extends readonly Event[] = readonly []>(
	opts?: EventOpts<Events>,
) {
	const { events = [] } = opts ?? {};

	return <
		JobTypes extends readonly JobType[] = JobType[],
		Metadata = unknown,
		J extends JobType = JobsFromArray<JobTypes>,
		Id extends J["id"] = J["id"],
		Plugins extends Record<string, any> = {},
	>(
		instance: JobbigInstance<JobTypes, Metadata, J, Id, Plugins>,
	): EventPluginReturn<Events, JobTypes, Metadata, J, Id, Plugins> => {
		const pluginMethods = {
			get jobs(): JobType[] {
				return [
					...instance.jobs,
					...events.map((e) =>
						Job({
							id: e.type,
							schema: e.schema,
							run: e.handler,
						}),
					),
				];
			},

			publish: async <SpecificType extends EventsFromArray<Events>["type"]>(
				event: EventData<
					SpecificType,
					StandardSchemaV1.InferInput<
						SchemaForType<EventsFromArray<Events>, SpecificType>
					>
				>,
			) => {
				const matchedEvent = events.find((e) => e.type === event.type);
				if (!matchedEvent) throw new Error(`Event ${event.type} not found`);

				let result = matchedEvent.schema["~standard"].validate(event.payload);
				if (result instanceof Promise) result = await result;

				// if the `issues` field exists, the validation failed
				if (result.issues) {
					throw new Error(JSON.stringify(result.issues, null, 2));
				}

				await instance.schedule({
					jobId: event.type,
					data: event.payload,
				});
			},

			handle<
				const NewSchema extends StandardSchemaV1,
				const NewType extends string,
			>(event: {
				type: NewType;
				schema: NewSchema;
				handler: (
					opts: RunInput<StandardSchemaV1.InferInput<NewSchema>>,
				) => Promise<void>;
			}) {
				// Create a new event from the input
				const newEvent: Event<NewSchema, NewType> = {
					type: event.type,
					schema: event.schema,
					handler: event.handler,
				};

				// Create a new plugin with the updated events array
				const updatedPlugin = EventPlugin({
					events: [...events, newEvent] as readonly [
						...Events,
						Event<NewSchema, NewType>,
					],
				});

				// Apply the updated plugin to the instance
				return instance.use(updatedPlugin);
			},
		};

		return pluginMethods as EventPluginReturn<
			Events,
			JobTypes,
			Metadata,
			J,
			Id,
			Plugins
		>;
	};
}

export const event = <T extends StandardSchemaV1, Id extends string>({
	type,
	handler,
	schema,
}: Event<T, Id>) => {
	if (!type || type.length === 0) {
		throw new Error(`Event type must be a non-empty string`);
	}
	if (type.length > 255) {
		throw new Error(`Event type must be less than 255 characters`);
	}

	return {
		type,
		handler: async ({ ctx }: RunInput<T>) => {
			let result = schema["~standard"].validate(ctx.data);
			if (result instanceof Promise) result = await result;

			// if the `issues` field exists, the validation failed
			if (result.issues) {
				throw new Error(JSON.stringify(result.issues, null, 2));
			}

			return handler({ ctx });
		},
		schema,
	};
};
