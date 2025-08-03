import { RouterProvider } from "@tanstack/solid-router";
import { router } from "./router";

import "./styles/index.css";

export default function App() {
	return <RouterProvider router={router} />;
}
