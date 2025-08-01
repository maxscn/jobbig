import { type OrchestratorOpts, orchestrator, type Runner } from "@jobbig/core";
export function cron(): Runner {

  return {
    run: async (opts: OrchestratorOpts) => {
      let exhausted;
      const poll = orchestrator(opts);
      do {
        const info = await poll();
        exhausted = info.exhausted;
      } while (!exhausted)

    }
  }
}
