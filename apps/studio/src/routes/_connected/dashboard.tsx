import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/_connected/dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/(connected)/dashboard/"!</div>;
}
