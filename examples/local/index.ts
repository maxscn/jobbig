import { Job, Jobbig } from "@jobbig/core";
import { ServerPlugin } from "@jobbig/core/plugins";
import { sleep } from "@jobbig/core/utils";
import { LocalStore } from "@jobbig/local";
import { z } from "zod";

const runs = [
  {
    id: "run1",
    jobId: "job1",
    currentStep: 0,
    data: {},
    scheduledAt: new Date(),
    status: "pending",
    createdAt: new Date(),
  },
  {
    id: "run2",
    jobId: "job2",
    currentStep: 0,
    data: {
      input: 1,
      output: 2,
    },
    scheduledAt: new Date(Date.now() + 5000),
    status: "pending",
    createdAt: new Date(),
  },
  {
    id: "run3",
    jobId: "job2",
    currentStep: 1,
    data: {},
    scheduledAt: new Date(Date.now() + 10000),
    status: "pending",
    createdAt: new Date(),
  },
] as const;

const store = LocalStore({});

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

const jobbig = Jobbig({
  store,
  jobs,
}).use(ServerPlugin());

await jobbig.schedule({
  jobId: "job2",
  data: { input: 1 },
});

for (const run of runs) {
  await jobbig.schedule(run);
}

jobbig.server();
