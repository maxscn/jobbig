import type { Step } from "./step";

export interface Run {
  id: string;
  jobId: string;
  status: RunStatus;
  scheduledAt: Date;
  data: any;
  currentStep: number;
}

export interface Context<T> {
	data: T;
  step: Step;
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
