import { ulid } from "ulid";
import { Jobbig, type JobbigInstance } from "./jobbig";
import type { RunData } from "./run";
import { Step } from "./step";
import { ScopedStore } from "./store";
import { sleep } from "./utils/sleep";

const MAX_INTERNAL_SLEEP_MS = 100000;
export interface RunnerOpts {
	run: RunData;
	jobbig: JobbigInstance;
}
export interface Runner {
	run(): Promise<void>;
}

class AbortError extends Error {}

export function BaseRunner({ run, jobbig }: RunnerOpts): Runner {
	const jobs = jobbig.jobs;
	return {
		async run() {
			const store = await jobbig.store;
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
						schedule: Jobbig.bind(jobbig)({
							jobs: jobbig.jobs,
							store: jobbig.store,
							metadata: run.metadata,
							plugins: jobbig.plugins,
						}).schedule,
						sleep: async (ms: number) =>
							step.run(`sleep-${ms}-${ulid()}`, async () => {
								if (ms > MAX_INTERNAL_SLEEP_MS) {
									await store.set(
										run.id,
										"scheduledAt",
										new Date(Date.now() + ms),
									);
									const current = await store.fetch(run.id);
									if (current) {
										await store.push(current);
									}
									throw new AbortError("rest of the run aborted");
								} else {
									await sleep(ms);
								}
							}),
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
				if (err instanceof AbortError) {
					await store.unlock(run.id);
				} else if ((job.retries ?? 0) < (run.attempt ?? 0)) {
					await store.set(run.id, "attempt", (run.attempt ?? 0) + 1);
					await store.unlock(run.id);
				} else {
					await store.set(run.id, "status", "failure");
				}
			} finally {
				await step.cleanup();
			}
		},
	};
}
