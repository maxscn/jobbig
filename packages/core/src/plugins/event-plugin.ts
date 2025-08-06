import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Job, type JobType } from "../job";
import type { JobbigInstance } from "../jobbig";
import type { RunInput } from "../run";

type EventData<Type extends string = string, Payload = unknown> = {
	type: Type;
	payload: Payload;
};

interface EventOpts<T extends readonly Event[] = any> {
	events: T;
}
interface Event<T extends StandardSchemaV1 = any, Id extends string = string> {
	type: Id;
	schema: T;
	handler: (input: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
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

type EventsFromArray<T extends readonly Event[]> = T[number];

type SchemaForType<E extends Event, Type extends E["type"]> = Extract<
	E,
	{ type: Type }
>["schema"];

export function EventPlugin<
	T extends readonly Event[] = any,
	E extends Event = EventsFromArray<T>,
	Type extends E["type"] = E["type"],
>(opts?: EventOpts<T>) {
	const { events = [] } = opts ?? {};
	return (instance: JobbigInstance) => ({
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
		publish: async <SpecificType extends Type>(
			event: EventData<
				SpecificType,
				StandardSchemaV1.InferInput<SchemaForType<E, SpecificType>>
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
		handle<const NewJobOrEvent extends JobType | Event>(
			jobOrEvent: NewJobOrEvent,
		) {
			if ("run" in jobOrEvent) {
				// It's a Job
				return instance.handle(jobOrEvent);
			} else {
				// It's an Event - convert to Job and handle
				const eventAsJob = Job({
					id: jobOrEvent.type,
					schema: jobOrEvent.schema,
					run: jobOrEvent.handler,
				});
				instance.handle(eventAsJob);
				return this;
			}
		},
	});
}
