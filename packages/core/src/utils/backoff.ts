export function backoff(attempt: number): number {
	return Math.min(1000 * 2 ** attempt, 60000);
}
