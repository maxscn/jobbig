# Jobbig
[![release](https://github.com/maxscn/jobbig/actions/workflows/release.yml/badge.svg)](https://github.com/maxscn/jobbig/actions/workflows/release.yml)
\
\
\[ˈjɔbːɪɡ\] the swedish word for **bothersome**

A TypeScript library for type-safe durable workflows with pluggable storage/queue backends.

> This is the first library I have ever published, I might not get everything right immediately. Before version 1.0.0, there will be breaking changes. Before 1.0.0, I will treat minor versions as major versions and patches as both bug fixes and features.

## Quick Start

```typescript
import { Job, Jobbig } from "@jobbig/core";
import { ServerPlugin } from "@jobbig/core/plugins";
import { LocalStore } from "@jobbig/local";
import { z } from "zod";

// 1) Define a job with steps
const processData = Job({
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

// 2) Instantiate a store
const store = LocalStore({});

// 3) Create Jobbig, register plugins/jobs, and start the server worker
const jobbig = Jobbig({
  store,
  jobs: [processData],
}).use(ServerPlugin());

// 4) Schedule runs
await jobbig.schedule({
  jobId: "process-data",
  data: { input: 42 },
});

// 5) Start processing
jobbig.server();

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
	run(): Promise<{
		promise: Promise<any>,
		amount: number
	}>;
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
	run(opts: RunInput<StandardSchemaV1.InferInput<T>, string, JobbigInstance>): Promise<void>;
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
		beforeRun?(opts: RunInput<StandardSchemaV1.InferInput<T>, string, JobbigInstance>): Promise<void>;
		afterRun?(opts: RunInput<StandardSchemaV1.InferInput<T>, string, JobbigInstance>): Promise<void>;
		beforeStep?(opts: RunInput<StandardSchemaV1.InferInput<T>, string, JobbigInstance>): Promise<void>;
		afterStep?(opts: RunInput<StandardSchemaV1.InferInput<T>, string, JobbigInstance>): Promise<void>;
	};
}
```

### Step
A step is a smaller part of a job, which consists of a handler and an id. A step with a given id will only be executed once per job. While the core logic of the job will be rerun on retries.

```typescript
export interface Step {
	run(id: string, handler: () => Promise<void>): Promise<void>;
	cleanup(): Promise<void>;
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

### Context
The context provides access to job data, utilities, and scheduling capabilities within job handlers.

```typescript
export type Context<T, Id extends string, I extends JobbigInstance> = {
	/**
	 * The id of the running job.
	 */
	id: Id;
	/**
	 * Data contained within the run.
	 */
	data: T;
	/**
	 * Step runner for the current job.
	 */
	step: Step;
	/**
	 * Scoped store for the current run.
	 */
	store: ScopedStore;
	/**
	 * Metadata passed when scheduling the job.
	 */
	metadata?: Record<string, unknown>;
	/**
	 * Schedule a new job run.
	 */
	schedule: I["schedule"];
	/**
	 * Sleep for a specified duration (ms). Uses steps for durability.
	 */
	sleep: (ms: number) => Promise<void>;
};
```

### Store
A store contains the state of each run and the polling/locking used by workers.

```typescript
export interface Store {
  push(run: RunData): Promise<void>;
  poll(amount: number): Promise<{ runs: RunData[]; info: { exhausted: boolean } }>;
  set<T extends keyof RunData>(runId: string, key: T, value: RunData[T]): Promise<void>;
  get<T extends keyof RunData>(runId: string, key: T): Promise<RunData[T] | undefined>;
  fetch(runId: string): Promise<RunData | undefined>;
  lock(runId: string): Promise<boolean>;
  unlock(runId: string): Promise<boolean>;
  isLocked(runId: string): Promise<boolean>;
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

<!-- Removed Queue and Publisher sections; the new API schedules via Jobbig and stores/polls via Store. -->

## Development

### Prerequisites
- **Required**: Node.js **v24+** (project uses modern ES modules and features)
- **Recommended**: Use nvm for Node.js version management
- **Setup**: `nvm use default` to use the latest Node.js version

### Package Manager
- **Required**: bun v1.2.20 (specified in package.json)
- **Install**: `curl -fsSL https://bun.sh/install | bash`


### 1. Install Dependencies
```bash
bun install
```

### 2. Build all packages
```bash
bun run build
```

### 3. Run the example
```bash
cd examples/local
bun run index.ts
```

## Example

See [`examples/local/index.ts`](examples/local/index.ts) for a complete working example with:

- Multiple job definitions
- Step-based execution
- Local storage setup
- Server plugin configuration

## License

MIT

