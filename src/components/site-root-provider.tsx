"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { docsRoute, siteBasePath, withBasePath } from "@/lib/shared";

export function SiteRootProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const relativePathname =
    siteBasePath && pathname.startsWith(siteBasePath)
      ? pathname.slice(siteBasePath.length) || "/"
      : pathname;
  const isDocsRoute =
    relativePathname === docsRoute ||
    relativePathname.startsWith(`${docsRoute}/`);

  return (
    <RootProvider
      search={{
        options: {
          type: "static",
          api: withBasePath("/api/search"),
        },
      }}
      theme={{
        defaultTheme: isDocsRoute ? "dark" : "system",
        disableTransitionOnChange: false,
      }}
    >
      {children}
    </RootProvider>
  );
}
