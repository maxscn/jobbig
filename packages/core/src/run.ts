import { ulid } from "ulid";
import type { Step } from "./step";
import type { ScopedStore } from "./store";
import type { JobbigInstance } from "./jobbig";

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
	attempt?: number | null;
}


export type Context<T, I extends JobbigInstance<any, any, any> = JobbigInstance<any, any, any>> = {
	/**
	 * Data contained within the run.
	 */
	data: T;
	/**
	 * Function to run steps. These do not rerun on retries or after sleeping.
	 */
	step: Step;
	/**
	 * Store which you can use to interact with the run.
	 */
	store: ScopedStore;
	/**
	 * Metadata connected to the jobbig-instance
	 */
	metadata: unknown;
	/**
	 * Sleep for a given amount of time in milliseconds. If under a threshold (100s) it will use setTimeout, otherwise it will schedule execution to be at a later time.
	 * This is treated as a step and not rerun.
	 * @param ms time to sleep in milliseconds
	 * @returns
	 */
	sleep: (ms: number) => Promise<void>;
	/**
	 * Schedule a new run
	 * @param run The data of the new run
	 * @returns
	 */
	schedule: I["schedule"];
}

export const RunStatus = {
	PENDING: "pending",
	RUNNING: "running",
	SUCCESS: "success",
	FAILURE: "failure",
} as const;

export type RunStatus = (typeof RunStatus)[keyof typeof RunStatus];

export interface RunInput<T, I extends JobbigInstance<any, any, any>> {
	ctx: Context<T, I>;
}
export type RunOpts<JobId extends string = string, JobData = unknown> = {
	jobId: JobId;
	data?: JobData;
	metadata?: unknown;
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
