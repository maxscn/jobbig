import { ulid } from "ulid";
import type { Step } from "./step";
import type { ScopedStore } from "./store";

export interface RunData {
	id: string;
	jobId: string;
	status: RunStatus;
	scheduledAt: Date;
	data?: unknown | null;
	metadata?: unknown | null;
	result?: unknown | null;
	currentStep: number;
	startedAt?: Date | null;
	createdAt: Date;
	finishedAt?: Date | null;
}

export interface Context<T> {
	data: T;
	step: Step;
	store: ScopedStore;
}

export const RunStatus = {
	PENDING: "pending",
	RUNNING: "running",
	SUCCESS: "success",
	FAILURE: "failure",
} as const;

export type RunStatus = (typeof RunStatus)[keyof typeof RunStatus];

export interface RunInput<T> {
	ctx: Context<T>;
}
export type RunOpts<JobId extends string = string, JobData = unknown> = {
	jobId: JobId;
	data: JobData;
	metadata: unknown;
	scheduledAt?: Date;
};

export function Run(opts: RunOpts): RunData {
	return {
		id: ulid(),
		jobId: opts.jobId,
		data: opts.data,
		metadata: opts.metadata,
		status: RunStatus.PENDING,
		scheduledAt: opts.scheduledAt || new Date(),
		currentStep: 0,
		createdAt: new Date(),
	};
}
