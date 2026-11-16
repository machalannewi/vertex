"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Renders children at a fixed design width and scales them down uniformly to
// fit narrower containers, so a product mockup keeps its exact desktop
// composition on every screen.
export function FitScale({
  width,
  children,
}: {
  width: number;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const s = Math.min(1, o.clientWidth / width);
      setScale(s);
      setHeight(i.offsetHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div
      ref={outer}
      className="w-full"
      style={scale < 1 ? { height, overflow: "hidden" } : undefined}
    >
      <div
        ref={inner}
        className="origin-top-left"
        style={{
          width: scale < 1 ? width : "100%",
          transform: scale < 1 ? `scale(${scale})` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
