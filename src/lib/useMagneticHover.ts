"use client";

import { useRef, useState, MouseEvent } from "react";

/**
 * Magnetic hover effect: the element subtly follows the cursor within its
 * own bounds, then springs back on mouse leave. Attach the returned
 * handlers + ref to any element (typically one already using the
 * `.magnetic-btn` class for the transition timing).
 *
 * strength: how far the element travels relative to cursor offset (0-1).
 * Lower = subtler. 0.25-0.35 reads as "premium" without feeling gimmicky.
 */
export function useMagneticHover(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    setOffset({ x: relX * strength, y: relY * strength });
  }

  function handleMouseLeave() {
    setOffset({ x: 0, y: 0 });
  }

  return {
    ref,
    style: {
      transform: `translate(${offset.x}px, ${offset.y}px)`,
    },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}