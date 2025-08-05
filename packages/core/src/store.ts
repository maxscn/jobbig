import type { RunData } from "./run";

export interface StudioStore extends Store {
	list(lastKey: string | number): Promise<RunData[]>;
}

export interface Store {
	store(run: RunData): Promise<void>;
	set<T extends keyof RunData>(
		runId: string,
		key: T,
		value: RunData[T],
	): Promise<void>;
	get<T extends keyof RunData>(
		runId: string,
		key: T,
	): Promise<RunData[T] | undefined>;
	fetch(runId: string): Promise<RunData | undefined>;
	lock(runId: string): Promise<boolean>;
	unlock(runId: string): Promise<boolean>;
	isLocked(runId: string): Promise<boolean>;
}

export interface ScopedStore {
	set<T extends keyof RunData>(key: T, value: RunData[T]): Promise<void>;
	get<T extends keyof RunData>(key: T): Promise<RunData[T] | undefined>;
}

export function ScopedStore(runId: string, store: Store): ScopedStore {
	return {
		set<T extends keyof RunData>(key: T, value: RunData[T]): Promise<void> {
			return store.set(runId, key, value);
		},
		get<T extends keyof RunData>(key: T): Promise<RunData[T] | undefined> {
			return store.get(runId, key);
		},
	};
}
