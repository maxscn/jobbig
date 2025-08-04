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
			const status = await store.get(run.id, "status");
			if (status !== "pending") {
				return;
			}
			await store.set(run.id, "status", "running");
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

				await store.set(run.id, "status", "success");
			} catch (err) {
				console.error(err);
				await store.set(run.id, "status", "failure");
			} finally {
				await step.cleanup();
			}
		},
	};
}
