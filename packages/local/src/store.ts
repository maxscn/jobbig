import { type MetadataStore, RunStatus } from "@jobbig/core";

type StoredTask = {
	context: any;
	status: RunStatus;
	currentStep: number;
};
type Store =  {
	[taskId: string]: StoredTask;
}
export function LocalStore(state: Store): MetadataStore {

  const store = state;

  return {
    async setStatus(taskId: string, status: RunStatus) {
      if (!store?.[taskId]) {
        throw new Error(`Task ${taskId} does not exist`);
      }
      store[taskId] = { ...store[taskId], status };
    },
    async getStatus(taskId: string) {
      return store[taskId]?.status ?? RunStatus.PENDING;
    },
    async setContext(taskId: string, context: any) {
      if (!store?.[taskId]) {
        throw new Error(`Task ${taskId} does not exist`);
      }
      store[taskId] = { ...store[taskId], context };
    },
    async getContext(taskId: string) {
      return store[taskId]?.context;
    },
    async setCurrentStep(runId, step) {
      if (!store?.[runId]) {
        throw new Error(`Run ${runId} does not exist`);
      }
      store[runId] = { ...store[runId], currentStep: step };
    },
    async getCurrentStep(runId) {
      return store[runId]?.currentStep ?? 0;
    }

  }
}
