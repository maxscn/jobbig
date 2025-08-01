# Jobbig

A TypeScript job orchestration framework with step-by-step execution, schema validation, and pluggable storage/queue backends.

## Features

- **Step-based execution**: Break jobs into resumable steps that can be retried individually
- **Schema validation**: Type-safe job inputs with standard schema integration
- **Pluggable backends**: Support for different queue and storage implementations
- **Local development**: Built-in local queue and storage for development
- **Server runner**: HTTP server for job execution and monitoring

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
    await ctx.step.run("validate", async () => {
      console.log("Validating input...");
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
server({
  queue,
  store,
  jobs: [myJob],
});
```

## Architecture

Jobbig consists of several packages:

- **`@jobbig/core`**: Core job definitions, types, and orchestration logic
- **`@jobbig/local`**: Local implementations of queue and storage for development
- **`@jobbig/runners`**: Job execution runners (server, cron, etc.)

## Job Execution Model

Jobs in Jobbig are executed step-by-step with automatic resumption:

1. **Job Definition**: Define jobs with schema validation and step-based execution
2. **Run Scheduling**: Jobs are scheduled as runs with specific data and timing
3. **Step Execution**: Each step is executed in order, with state persisted between steps
4. **Resumption**: If a job fails, it can resume from the last completed step

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
