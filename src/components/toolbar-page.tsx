"use client";

import { useTheme } from "fumadocs-ui/provider/base";
import {
  Contrast,
  Download,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CollapsibleMedia,
  ImageCollapseBoundary,
} from "@/components/collapsible-image";
import { cn } from "@/lib/cn";

function ToolbarButton({
  active,
  children,
  label,
  ...props
}: ComponentProps<"button"> & {
  active?: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring [&_svg]:size-4",
        active && "bg-fd-primary/12 text-fd-primary",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function ToolbarPage({
  children,
  className,
  ...props
}: ComponentProps<"span">) {
  const { resolvedTheme } = useTheme();
  const [inverted, setInverted] = useState(false);
  const [scale, setScale] = useState(20);
  const [defaultScale, setDefaultScale] = useState(20);
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLSpanElement>(null);
  const defaultScaleRef = useRef(20);

  useEffect(() => {
    setInverted(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const applyResponsiveDefault = () => {
      const nextDefault = media.matches ? 100 : 20;
      setScale((current) =>
        current === defaultScaleRef.current ? nextDefault : current,
      );
      defaultScaleRef.current = nextDefault;
      setDefaultScale(nextDefault);
    };

    applyResponsiveDefault();
    media.addEventListener("change", applyResponsiveDefault);
    return () => media.removeEventListener("change", applyResponsiveDefault);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === frameRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const downloadImage = useCallback(async () => {
    const image = frameRef.current?.querySelector("img");
    if (!image?.currentSrc && !image?.src) return;

    const source = image.currentSrc || image.src;
    const link = document.createElement("a");
    try {
      const response = await fetch(source);
      const blob = await response.blob();
      const extension =
        blob.type.split("/")[1]?.replace("jpeg", "jpg") || "png";
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${image.alt.trim() || "image"}.${extension}`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      link.href = source;
      link.download = image.alt.trim() || "image";
      link.click();
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!frameRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await frameRef.current.requestFullscreen();
    }
  }, []);

  return (
    <CollapsibleMedia label="图片预览">
      <span
        {...props}
        ref={frameRef}
        className={cn(
          "block overflow-hidden rounded-xl border bg-fd-card shadow-sm fullscreen:overflow-auto fullscreen:rounded-none fullscreen:border-0 fullscreen:bg-fd-background",
          className,
        )}
      >
        <span className="sticky top-0 z-10 flex min-h-11 items-center gap-1 border-b bg-fd-card/95 px-2 py-1.5 backdrop-blur">
          <ToolbarButton label="下载图片" onClick={downloadImage}>
            <Download />
          </ToolbarButton>
          <ToolbarButton
            label={inverted ? "关闭反色" : "开启反色"}
            active={inverted}
            aria-pressed={inverted}
            onClick={() => setInverted((value) => !value)}
          >
            <Contrast />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-fd-border" aria-hidden="true" />
          <label className="flex min-w-0 flex-1 items-center gap-2 px-1 text-xs text-fd-muted-foreground">
            <span className="sr-only">调整图片大小</span>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={scale}
              onInput={(event) => setScale(Number(event.currentTarget.value))}
              className="h-1.5 min-w-16 flex-1 cursor-pointer accent-fd-primary"
            />
            <output className="w-9 text-end tabular-nums">{scale}%</output>
          </label>
          <ToolbarButton
            label="恢复默认大小"
            disabled={scale === defaultScale}
            onClick={() => setScale(defaultScale)}
            className="disabled:pointer-events-none disabled:opacity-35"
          >
            <RotateCcw />
          </ToolbarButton>
          <ToolbarButton
            label={fullscreen ? "退出全屏" : "全屏查看"}
            aria-pressed={fullscreen}
            onClick={toggleFullscreen}
          >
            {fullscreen ? <Minimize2 /> : <Maximize2 />}
          </ToolbarButton>
        </span>
        <span
          className={cn(
            "flex min-h-24 items-start justify-center overflow-auto bg-fd-muted/20 p-3 fullscreen:min-h-[calc(100vh-2.75rem)] fullscreen:items-center [&_img]:m-0 [&_img]:h-auto [&_img]:w-full [&_img]:max-w-none [&_img]:rounded-md [&_img]:transition-[filter,width]",
            inverted && "[&_img]:invert",
          )}
        >
          <span style={{ width: `${scale}%` }}>
            <ImageCollapseBoundary>{children}</ImageCollapseBoundary>
          </span>
        </span>
      </span>
    </CollapsibleMedia>
  );
}
