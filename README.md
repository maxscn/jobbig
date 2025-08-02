# Jobbig

\[ˈjɔbːɪɡ\] the swedish word for **bothersome**

A TypeScript job orchestration framework with step-by-step execution, schema validation, and pluggable storage/queue backends.

> [!NOTE]
> This is the first library I ever published, I might not get everything right immediately. Before version 1.0.0, there will be breaking changes. Before 1.0.0, I will treat minor versions as major versions and patches as both bug fixes and features.

## Quick Start

```typescript
import { job } from "@jobbig/core";
import { LocalQueue, LocalStore } from "@jobbig/local";
import { server } from "@jobbig/runners";
import { z } from "zod";

// Define a job with steps
const myJob = job({
  id: "process-data",
  schema: z.object({
    input: z.number(),
    output: z.number().optional(),
  }),
  run: async ({ ctx }) => {
    await ctx.step.run("preprocess", async () => {
      console.log("Preprocessing input...");
    });

    await ctx.step.run("process", async () => {
      console.log("Processing data...");
    });

    await ctx.step.run("save", async () => {
      console.log("Saving results...");
    });
  },
});

// Set up local storage and queue
const queue = LocalQueue([]);
const store = LocalStore({});



// Start the server
const worker = ContinousWorker({
  queue,
  store,
  jobs: [myJob],
});
worker.start();



// Create the publisher
const publisher = Publisher({
	queue,
	store,
});

// Publish runs
for (const run of runs) {
	await publisher.publish(run);
}

```

## Concepts

A brief explanation of the key interfaces and concepts of Jobbig.

### Worker
A worker is a handler for different types of environments.

```typescript
interface Worker {
	start(): Promise<void>;
}
```

### Orchestrator
An orchestrator specifies how the polling of jobs is done. In a cron job, it exhausts the queue until it is empty, but in a server environment, it constantly polls the queue for new jobs within a specified interval.

### Runner
A runner is responsible for executing jobs. There exists a [`BaseRunner`](packages/core/src/runner.ts), which is likely sufficient in most cases.

```typescript
export interface Runner {
	run: () => Promise<void>;
}
```

### Job
A job is a function which can be scheduled. A job can consist of multiple steps.

```typescript
export interface Job<T extends StandardSchemaV1 = any> {
	/**
	 * Unique identifier of the jobs. Used to match handlers with runs.
	 */
	id: string;
	/**
	 * The job runner.
	 * @param opts - The options for running the job.
	 * @returns A promise that resolves when the job is completed.
	 */
	run: (opts: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
	/**
	 * Schema of the data
	 */
	schema: T;
	retries?: {
		/**
		 * Max amount of retries
		 * @default 0
		 */
		amount?: number;
		/**
		 * Defaults to exponential backoff
		 * @param attempt (the current attempt, starts at 0)
		 * @returns delay
		 */
		delayFn?: (attempt: number) => number;
	};

	hooks?: {
		beforeRun?: ({
			ctx,
		}: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
		afterRun?: ({
			ctx,
		}: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
		beforeStep?: ({
			ctx,
		}: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
		afterStep?: ({
			ctx,
		}: RunInput<StandardSchemaV1.InferInput<T>>) => Promise<void>;
	};
}
```

### Step
A step is a smaller part of a job, which consists of a handler and an id. A step with a given id will only be executed once per job. While the core logic of the job will be rerun on retries.

```typescript
export interface Step {
	run: (id: string, handler: () => Promise<void>) => Promise<void>;
	cleanup: () => Promise<void>;
}
```

### Run
A run is a scheduled execution of a job. It contains metadata about the jobs execution, such as the status, start time, end time, results and the current execution step.

```typescript
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
```

### Store
A store contains the state of the run. I choose to separate it from **Queue** to allow for things that cannot fetch specific data.

```typescript
export interface Store {
	store(run: Run): Promise<void>;
	set<T extends keyof Run>(runId: string, key: T, value: Run[T]): Promise<void>;
	get<T extends keyof Run>(runId: string, key: T): Promise<Run[T] | undefined>;
	fetch(runId: string): Promise<Run | undefined>;
}
```

#### ScopedStore
A scoped store is a store that is scoped to a specific run. It is used to store and retrieve data for a specific run, so that it can be used in the context of the job without being able to impact other runs.

```typescript
export interface ScopedStore {
	set<T extends keyof Run>(key: T, value: Run[T]): Promise<void>;
	get<T extends keyof Run>(key: T): Promise<Run[T] | undefined>;
}
```

### Queue
A queue is responsible for storing and retrieving runs. It is used to schedule and execute jobs.

```typescript
export interface QueueInfo {
  exhausted: boolean;
}

export interface Queue {
	push: (run: Run) => Promise<unknown>;
  poll: (amount: number) => Promise<{ runs: Run[], info: QueueInfo }>;
}
```

### Publisher
A publisher is responsible for publishing runs to a queue.

```typescript
export interface Publisher {
	publish: (run: Run) => Promise<void>;
}
```

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run the example
cd examples/local
bun run index.ts
```

## Example

See [`examples/local/index.ts`](examples/local/index.ts) for a complete working example with:

- Multiple job definitions
- Step-based execution
- Local queue and storage setup
- Server runner configuration

## License

MIT
