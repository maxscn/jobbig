// src/routes/__root.tsx
/// <reference types="vite/client" />

import { clientOnly } from "@solidjs/start";
import { createRootRoute, Link, Outlet } from "@tanstack/solid-router";
import { Suspense } from "solid-js";

const Devtools = clientOnly(() => import("../components/dev-tools"));

export const Route = createRootRoute({
	head: () => ({
		meta: [
			// your meta tags and site config
		],
		// links: [{ rel: "stylesheet", href: appCss }],
		// other head config
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<Suspense>
			<Outlet />
			<Devtools />
		</Suspense>
	);
}
