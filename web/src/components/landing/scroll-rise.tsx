"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Scroll-linked rise: the dashboard lifts out of the hero arc and settles to
// full size as it scrolls into view, like the reference's opening sequence.
export function ScrollRise({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the element's top sits at the bottom of the viewport,
      // 1 once its top has risen to 25% of the viewport height.
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.75)));
      const eased = 1 - Math.pow(1 - progress, 3);
      const y = (1 - eased) * 90;
      const scale = 0.9 + eased * 0.1;
      node.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      node.style.opacity = String(0.55 + eased * 0.45);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("origin-top will-change-transform", className)}
    >
      {children}
    </div>
  );
}
