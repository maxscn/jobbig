import type { Run } from "./run";

export interface Store {
	store(run: Run): Promise<void>;
	set<T extends keyof Run>(runId: string, key: T, value: Run[T]): Promise<void>;
	get<T extends keyof Run>(runId: string, key: T): Promise<Run[T] | undefined>;
	fetch(runId: string): Promise<Run | undefined>;
}

export interface RunStore {
	set<T extends keyof Run>(key: T, value: Run[T]): Promise<void>;
	get<T extends keyof Run>(key: T): Promise<Run[T] | undefined>;
}

export function ScopedStore(runId: string, store: Store): RunStore {
	return {
		set<T extends keyof Run>(key: T, value: Run[T]): Promise<void> {
			return store.set(runId, key, value);
		},
		get<T extends keyof Run>(key: T): Promise<Run[T] | undefined> {
			return store.get(runId, key);
		},
	};
}
