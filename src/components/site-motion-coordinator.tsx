"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { docsRoute, siteBasePath, withBasePath } from "@/lib/shared";

type PendingRoute = {
  from: string;
  resolve: () => void;
  timeout: ReturnType<typeof setTimeout>;
};

function isDocsPath(pathname: string) {
  const docsBase = withBasePath(docsRoute);
  return pathname === docsBase || pathname.startsWith(`${docsBase}/`);
}

function getTransitionDirection(anchor: HTMLAnchorElement) {
  const sidebar = anchor.closest("#nd-sidebar, #nd-sidebar-mobile");
  if (!sidebar) return "forward";

  const links = Array.from(
    sidebar.querySelectorAll<HTMLAnchorElement>("a[href]"),
  ).filter((link) => link.origin === window.location.origin);
  const currentIndex = links.findIndex(
    (link) => link.dataset.active === "true",
  );
  const nextIndex = links.indexOf(anchor);

  if (currentIndex >= 0 && nextIndex >= 0 && nextIndex < currentIndex) {
    return "backward";
  }
  return "forward";
}

export function SiteMotionCoordinator() {
  const pathname = usePathname();
  const router = useRouter();
  const pendingRoute = useRef<PendingRoute | null>(null);
  const activeTransition = useRef<ViewTransition | null>(null);
  const pendingAnchor = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (typeof document.startViewTransition === "function") {
      document.documentElement.dataset.siteViewTransitions = "true";
    }

    return () => {
      delete document.documentElement.dataset.siteViewTransitions;
    };
  }, []);

  useEffect(() => {
    const pending = pendingRoute.current;
    if (!pending || pathname === pending.from) return;
    clearTimeout(pending.timeout);
    pending.resolve();
    pendingRoute.current = null;
  }, [pathname]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const cleanup = () => {
      if (pendingAnchor.current) {
        delete pendingAnchor.current.dataset.motionPending;
        pendingAnchor.current = null;
      }
      delete document.documentElement.dataset.siteTransition;
      delete document.documentElement.dataset.siteTransitionKind;
      delete document.documentElement.dataset.siteTransitionDirection;
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        reducedMotion.matches ||
        !document.startViewTransition
      ) {
        return;
      }

      const element = event.target instanceof Element ? event.target : null;
      const anchor = element?.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target ||
        anchor.hasAttribute("download") ||
        anchor.origin !== window.location.origin
      ) {
        return;
      }

      const destination = new URL(anchor.href);
      const isSameDocument =
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search;
      if (isSameDocument) return;

      event.preventDefault();
      const routePath =
        siteBasePath && destination.pathname.startsWith(siteBasePath)
          ? destination.pathname.slice(siteBasePath.length) || "/"
          : destination.pathname;
      const routeHref = `${routePath}${destination.search}${destination.hash}`;

      if (activeTransition.current) {
        activeTransition.current.skipTransition();
        activeTransition.current = null;
        cleanup();
        router.push(routeHref);
        return;
      }

      const docsTransition =
        isDocsPath(window.location.pathname) &&
        isDocsPath(destination.pathname);
      document.documentElement.dataset.siteTransition = "true";
      document.documentElement.dataset.siteTransitionKind = docsTransition
        ? "docs"
        : "page";
      document.documentElement.dataset.siteTransitionDirection =
        getTransitionDirection(anchor);
      anchor.dataset.motionPending = "true";
      pendingAnchor.current = anchor;

      const transition = document.startViewTransition(async () => {
        const routeReady = new Promise<void>((resolve) => {
          let settled = false;
          const complete = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            if (pendingRoute.current?.resolve === complete) {
              pendingRoute.current = null;
            }
            resolve();
          };
          const timeout = setTimeout(complete, 1600);
          pendingRoute.current = { from: pathname, resolve: complete, timeout };
        });

        router.push(routeHref);
        await routeReady;
      });

      activeTransition.current = transition;
      void transition.finished
        .catch(() => undefined)
        .finally(() => {
          activeTransition.current = null;
          cleanup();
        });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, router]);

  useEffect(
    () => () => {
      const pending = pendingRoute.current;
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve();
      }
      activeTransition.current?.skipTransition();
      if (pendingAnchor.current) {
        delete pendingAnchor.current.dataset.motionPending;
      }
      delete document.documentElement.dataset.siteTransition;
      delete document.documentElement.dataset.siteTransitionKind;
      delete document.documentElement.dataset.siteTransitionDirection;
      delete document.documentElement.dataset.siteViewTransitions;
    },
    [],
  );

  return <div className="docs-reading-progress" aria-hidden="true" />;
}
