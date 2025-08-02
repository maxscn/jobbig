import type { Run } from "./run";

export interface MetadataStore {
	store(run: Run): Promise<void>;
	set<T extends keyof Run>(runId: string, key: T, value: Run[T]): Promise<void>;
	get<T extends keyof Run>(runId: string, key: T): Promise<Run[T] | undefined>;
	fetch(runId: string): Promise<Run | undefined>;
}
