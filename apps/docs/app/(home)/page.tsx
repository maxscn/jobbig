import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex flex-1 flex-col justify-center text-center">
			<h1 className="text-3xl font-bold">Jobbig</h1>
			<h2 className="mb-4">Coming soon</h2>
			<p className="px-5 mx-auto text-fd-muted-foreground max-w-2xl mb-4">
				A TypeScript library for durable workflows schema validation, and
				pluggable storage/queue backends.
			</p>
			<p className="text-fd-muted-foreground">
				Peak at the{" "}
				<Link href="/docs" className="text-fd-info underline">
					docs
				</Link>
			</p>
		</main>
	);
}
