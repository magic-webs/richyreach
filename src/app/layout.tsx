import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "./layout-shell";

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin"],
});


export const metadata: Metadata = {
	title: "Reelio - AI Influencer Platform",
	description: "AI-Powered Influencer Brand Collaboration Platform",
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
			<body className={`${montserrat.className} antialiased bg-background text-foreground`}>
				<Providers>
					<LayoutShell>{children}</LayoutShell>
				</Providers>
			</body>
		</html>
	);
}

