# Jobbig

\[ˈjɔbːɪɡ\] the swedish word for **bothersome**

A TypeScript job orchestration framework with step-by-step execution, schema validation, and pluggable storage/queue backends.

> [!NOTE]
> This is the first library I ever published, I might not get everything right immediately. Before version 1.0.0, there will be breaking changes. Before 1.0.0, I will treat minor versions as major versions and patches as both bug fixes and features.

## Concepts

A brief explanation of the key interfaces and concepts of Jobbig.

### Worker
A worker is a handler for different types of environments.

### Orchestrator
An orchestrator specifies how the polling of jobs is done. In a cron job, it exhausts the queue until it is empty, but in a server environment, it constantly polls the queue for new jobs within a specified interval.

### Runner
A runner is responsible for executing jobs. There exists a [`BaseRunner`](packages/core/src/runner.ts), which is likely sufficient in most cases.

### Job
A job is a function which can be scheduled. A job can consist of multiple steps.

### Step
A step is a smaller part of a job, which consists of a handler and an id. A step with a given id will only be executed once per job. While the core logic of the job will be rerun on retries.

### Run
A run is a scheduled execution of a job. It contains metadata about the jobs execution, such as the status, start time, end time, results and the current execution step.

### Publisher
A publisher is responsible for publishing runs to a queue.

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
