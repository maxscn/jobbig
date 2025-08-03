import { createFileRoute } from "@tanstack/solid-router";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1 class="text-red-800">Hello world!</h1>
			<svg
				width="128"
				height="128"
				viewBox="0 0 128 128"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
				aria-labelledby="title desc"
			>
				<title id="title">
					J-shaped Arrow Icon (straight lines, arrow at end)
				</title>
				<desc id="desc">
					An arrow forming the shape of the letter J using straight segments,
					with the arrowhead at the lower end of the J.
				</desc>

				<path
					d="M64 16
       L64 88
       L96 88
       L96 104
       L64 104
       L64 112"
					fill="none"
					stroke="#1F2937"
					stroke-width="10"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>

				<path
					d="M64 112
       L54 100
       M64 112
       L74 100"
					fill="none"
					stroke="#1F2937"
					stroke-width="10"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<p>
				Visit{" "}
				<a href="https://start.solidjs.com" target="_blank" rel="noopener">
					start.solidjs.com
				</a>{" "}
				to learn how to build SolidStart apps.
			</p>
		</main>
	);
}
