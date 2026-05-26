import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "./layout-shell";

const montserrat = Montserrat({
	variable: "--font-sans",
	subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
	variable: "--font-serif",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	style: ["normal", "italic"],
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
			<body className={`${montserrat.variable} ${cormorantGaramond.variable} ${montserrat.className} antialiased bg-background text-foreground`}>
				<Providers>
					<LayoutShell>{children}</LayoutShell>
				</Providers>
			</body>
		</html>
	);
}

