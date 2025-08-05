import type { Runner } from "../runner";
import { backoff, sleep } from "../utils";

export function RetryableRunner({
	runner,
	retries,
}: {
	runner: Runner;
	retries: number;
}): Runner {
	return {
		run: async () => {
			let attempts = 0;
			while (attempts < retries) {
				try {
					return await runner.run();
				} catch (error) {
					console.error(error);
					attempts++;
					await sleep(backoff(attempts));
				}
			}
			throw new Error("Max retries exceeded");
		},
	};
}
