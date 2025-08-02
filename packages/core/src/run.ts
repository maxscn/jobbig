import type { Step } from "./step";
import type { RunStore, Store } from "./store";

export interface Run {
	id: string;
	jobId: string;
	status: RunStatus;
	scheduledAt: Date;
	data: unknown;
	result?: unknown;
	currentStep: number;
	startedAt?: Date;
	createdAt: Date;
	finishedAt?: Date;
}

export interface Context<T> {
	data: T;
	step: Step;
	store: RunStore;
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
