/**
 * When rerunning jobs due to failure, previous steps will be skipped.
 * Wrap logic you don't want to execute twice in a step.
 */
export interface Step {
	run(id: string, handler: () => Promise<void>): Promise<void>;
	cleanup(): Promise<void>;
}

interface StepOpts {
	/**
	 * Starts at 1.
	 */
	currentStep: number;
	setCurrentStep(step: number): Promise<void>;
	runId: string;
}

const visitedStepsRegistry: { [runId: string]: string[] } = {};

export function Step({ currentStep, runId, setCurrentStep }: StepOpts): Step {
	visitedStepsRegistry[runId] = [];
	return {
		async run(id: string, handler: () => Promise<void>) {
			const visitedSteps = visitedStepsRegistry[runId];
			if (!visitedSteps) throw new Error(`Run ${runId} not found.`);
			if (visitedSteps.includes(id))
				throw new Error(`Step ${id} already visited.`);

			visitedSteps.push(id);
			if (currentStep !== visitedSteps.length - 1) {
				return;
			}

			console.log(`Running step ${id}...`);
			await handler();
			await setCurrentStep(currentStep + 1);
			console.log(`Step ${id} completed.`);
		},
		cleanup: async () => {
			delete visitedStepsRegistry[runId];
		},
	};
}
