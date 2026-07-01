import type { Metadata, Viewport } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import LayoutShell from "./layout-shell";
import { Toaster } from "@/components/ui/sonner";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallBanner from "@/components/PwaInstallBanner";

const montserrat = Montserrat({
	variable: "--font-sans",
	subsets: ["latin"],
});

export const viewport: Viewport = {
	themeColor: "#7E1523",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export const metadata: Metadata = {
	title: "Richy Reach - Premium Brand & Influencer Collaboration Platform",
	description: "Connecting luxury brands and elite creators through high-conversion campaigns.",
	appleWebApp: {
		capable: true,
		title: "Richy Reach",
		statusBarStyle: "black-translucent",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.png" type="image/png" />
				<link rel="apple-touch-icon" href="/icon-192x192.png" />
			</head>
			<body className={`${montserrat.variable} ${montserrat.className} antialiased bg-background text-foreground`}>
				<Providers>
					<PwaRegister />
					<PwaInstallBanner />
					<LayoutShell>{children}</LayoutShell>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}

