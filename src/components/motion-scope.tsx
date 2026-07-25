"use client";

import type { ComponentProps, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef } from "react";

type MotionTarget = HTMLElement & {
  style: CSSStyleDeclaration;
};

function resetCard(card: MotionTarget) {
  card.style.setProperty("--motion-rotate-x", "0deg");
  card.style.setProperty("--motion-rotate-y", "0deg");
  card.style.setProperty("--motion-pointer-x", "50%");
  card.style.setProperty("--motion-pointer-y", "50%");
}

function resetMagnetic(target: MotionTarget) {
  target.style.setProperty("--motion-magnet-x", "0px");
  target.style.setProperty("--motion-magnet-y", "0px");
}

export function MotionScope({ children, ...props }: ComponentProps<"main">) {
  const scopeRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const revealTargets = Array.from(
      scope.querySelectorAll<HTMLElement>(".motion-reveal"),
    );

    scope.dataset.motionReady = "true";

    if (reducedMotion || !("IntersectionObserver" in window)) {
      for (const target of revealTargets) target.dataset.motionVisible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.motionVisible = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    for (const target of revealTargets) observer.observe(target);

    return () => observer.disconnect();
  }, []);

  const updatePointerEffects = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const card = target.closest<MotionTarget>(".motion-card");
    const magnetic = target.closest<MotionTarget>(".motion-cta");
    const { clientX, clientY } = event;

    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
        card.style.setProperty("--motion-rotate-x", `${(0.5 - y) * 3}deg`);
        card.style.setProperty("--motion-rotate-y", `${(x - 0.5) * 3}deg`);
        card.style.setProperty("--motion-pointer-x", `${x * 100}%`);
        card.style.setProperty("--motion-pointer-y", `${y * 100}%`);
      }

      if (magnetic) {
        const rect = magnetic.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width - 0.5) * 6;
        const y = ((clientY - rect.top) / rect.height - 0.5) * 6;
        magnetic.style.setProperty("--motion-magnet-x", `${x}px`);
        magnetic.style.setProperty("--motion-magnet-y", `${y}px`);
      }

      frameRef.current = null;
    });
  };

  const resetPointerEffects = (event: ReactPointerEvent<HTMLElement>) => {
    const target = event.target instanceof Element ? event.target : null;
    const related =
      event.relatedTarget instanceof Element ? event.relatedTarget : null;
    if (!target) return;

    const card = target.closest<MotionTarget>(".motion-card");
    if (card && (!related || !card.contains(related))) resetCard(card);

    const magnetic = target.closest<MotionTarget>(".motion-cta");
    if (magnetic && (!related || !magnetic.contains(related))) {
      resetMagnetic(magnetic);
    }
  };

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return (
    <main
      {...props}
      ref={scopeRef}
      data-motion-scope=""
      onPointerMove={updatePointerEffects}
      onPointerOut={resetPointerEffects}
    >
      {children}
    </main>
  );
}
