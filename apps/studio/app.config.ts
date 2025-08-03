import path from "node:path";
import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";

export default defineConfig({
	server: {
		preset: "vercel",
	},
	vite: {
		plugins: [tanstackRouter({ target: "solid" }), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(path.resolve(), "./src"),
			},
		},
	},
});
