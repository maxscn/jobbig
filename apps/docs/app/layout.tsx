import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

const geistMono = Geist_Mono({
	subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={geistMono.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
