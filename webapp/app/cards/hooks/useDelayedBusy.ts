"use client";
import { useEffect, useRef, useState } from 'react';

/**
 * Ensures a busy indicator (e.g. loader) stays visible for at least `minMs` once it turns on.
 * Returns whether the indicator should currently be shown.
 */
export function useDelayedBusy(active: boolean, minMs = 800) {
  const [visible, setVisible] = useState(false);
  const startRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (active) {
      // Turn on immediately
      if (!visible) setVisible(true);
      if (startRef.current == null) startRef.current = Date.now();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (!active && visible) {
      const elapsed = startRef.current ? Date.now() - startRef.current : 0;
      if (elapsed >= minMs) {
        setVisible(false);
        startRef.current = null;
      } else {
        // Delay hiding until minimum duration has elapsed
        timeoutRef.current = window.setTimeout(() => {
          setVisible(false);
          startRef.current = null;
          timeoutRef.current = null;
        }, Math.max(0, minMs - elapsed));
      }
    }
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [active, minMs, visible]);

  return visible;
}

export default useDelayedBusy;
