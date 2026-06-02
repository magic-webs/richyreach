import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "./layout-shell";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
	variable: "--font-sans",
	subsets: ["latin"],
});



export const metadata: Metadata = {
	title: "Richy Reach - Premium Brand & Influencer Collaboration Platform",
	description: "Connecting luxury brands and elite creators through high-conversion campaigns.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${montserrat.variable} ${montserrat.className} antialiased bg-background text-foreground`}>
				<Providers>
					<LayoutShell>{children}</LayoutShell>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}

