import type { Orchestrator, OrchestratorOpts } from "./orchestrator";

export interface Runner {
  run: (orchestrator: OrchestratorOpts) => Promise<void>;
}
