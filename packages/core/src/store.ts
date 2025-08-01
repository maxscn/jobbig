import type { RunStatus } from "./run";

export interface MetadataStore {
  setStatus(runId: string, status: RunStatus): Promise<void>;
  getStatus(runId: string): Promise<RunStatus>;
  setContext(runId: string, context: any): Promise<void>;
  getContext(runId: string): Promise<any>;
  setCurrentStep(runId: string, step: number): Promise<void>;
  getCurrentStep(runId: string): Promise<number>;
}
