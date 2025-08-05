import type { Job } from "./job";
import type { RunData } from "./run";
import { Step } from "./step";
import { ScopedStore, type Store } from "./store";

export interface RunnerOpts {
	run: RunData;
	store: Store;
	jobs: Job[];
}
export interface Runner {
	run(): Promise<void>;
}

export function BaseRunner({ run, store, jobs }: RunnerOpts): Runner {
	return {
		async run() {
			const lock = await store.lock(run.id);
			if (!lock) {
				return;
			}
			const job = jobs.find((job) => job.id === run.jobId);
			if (!job) {
				console.log("no job matches the run");
				await store.set(run.id, "status", "failure");
				return;
			}
			const step = Step({
				currentStep: run.currentStep,
				runId: run.id,
				setCurrentStep: async (step) => store.set(run.id, "currentStep", step),
			});
			try {
				const jobOpts = {
					ctx: {
						data: run.data,
						step,
						store: ScopedStore(run.id, store),
						metadata: run.metadata,
					},
				};
				await job.hooks?.beforeRun?.(jobOpts);
				await job.run(jobOpts);
				await job.hooks?.afterRun?.(jobOpts);
				// Consider if we want a complete function to do both of these.
				await store.set(run.id, "status", "success");
				await store.set(run.id, "finishedAt", new Date());
			} catch (err) {
				console.error(err);
				//TODO: If this is retryable we might want to do something else.
				// We might eventually want to separate the status of the job logic from the actual run, for easier rescheduling.
				await store.set(run.id, "status", "failure");
			} finally {
				await step.cleanup();
			}
		},
	};
}
