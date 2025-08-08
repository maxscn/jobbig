import { Job, Jobbig } from "@jobbig/core";
import { SQSPlugin } from "@jobbig/core/plugins";
import { must, sleep } from "@jobbig/core/utils";
import { LocalStore } from "@jobbig/local";
import type { SQSEvent } from "aws-lambda";
import { z } from "zod";

// Define jobs
const jobs = [
  Job({
    id: "job1",
    run: async () => {
      console.log("Running job 1...");
      await sleep(1000);
      console.log("Job 1 completed.");
    },
    schema: z.object(),
  }),
  Job({
    id: "job2",
    run: async ({ ctx }) => {
      console.log("Running job 2...");
      await ctx.step.run("step1", async () => {
        console.log("Running step 1...");
        await sleep(1000);
        console.log("Step 1 completed.");
      });
      await ctx.step.run("step2", async () => {
        console.log("Running step 2...");
        await sleep(1000);
        console.log("Step 2 completed.");
      });
      await sleep(1000);
      console.log("Job 2 completed.");
    },
    schema: z.object({
      input: z.number().min(1).max(100).optional(),
      output: z.number().min(1).max(100).optional(),
    }),
  }),
];

// Instantiate store and jobbig instance with SQS plugin
const store = LocalStore({});
const jobbig = Jobbig({
  store,
  jobs,
}).use(
  SQSPlugin({
    queueUrl: must(process.env.QUEUE_URL, "You must provide a queue URL"),
  }),
);

// Export a Lambda/SQS handler
export const { handler } = jobbig