import type { Run } from "./run";

export interface QueueInfo {
	exhausted: boolean;
}
export interface Queue {
	push(run: Run): Promise<unknown>;
	poll(amount: number): Promise<{ runs: Run[]; info: QueueInfo }>;
}
