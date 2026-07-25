import type { Metadata } from "next";
import "./global.css";
import { Inter } from "next/font/google";
import { SiteMotionCoordinator } from "@/components/site-motion-coordinator";
import { SiteRootProvider } from "@/components/site-root-provider";
import { siteOrigin } from "@/lib/shared";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <SiteMotionCoordinator />
        <SiteRootProvider>{children}</SiteRootProvider>
      </body>
    </html>
  );
}
