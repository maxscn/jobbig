import type { RunData } from "./run";

export interface QueueInfo {
	exhausted: boolean;
}

export interface Queue {
	push(run: RunData): Promise<unknown>;
	poll(amount: number): Promise<{ runs: RunData[]; info: QueueInfo }>;
}
