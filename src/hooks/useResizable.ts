import { useState, useCallback, useRef, useEffect } from "react";

interface Size {
  width: number;
  height: number;
}

export function useResizable(
  initialSize: Size = { width: 340, height: 520 },
  minSize: Size = { width: 280, height: 360 },
  maxSize: Size = { width: 600, height: 800 }
) {
  const [size, setSize] = useState<Size>(initialSize);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef<Size>(initialSize);

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...size };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  const onResizeTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    isResizing.current = true;
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startSize.current = { ...size };
    e.stopPropagation();
  }, [size]);

  useEffect(() => {
    const calc = (clientX: number, clientY: number) => {
      const dx = clientX - startPos.current.x;
      const dy = clientY - startPos.current.y;
      setSize({
        width: Math.min(maxSize.width, Math.max(minSize.width, startSize.current.width + dx)),
        height: Math.min(maxSize.height, Math.max(minSize.height, startSize.current.height + dy)),
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      calc(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isResizing.current) return;
      e.preventDefault();
      calc(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onEnd = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [minSize, maxSize]);

  const resetSize = useCallback(() => setSize(initialSize), [initialSize]);

  return { size, onResizeStart, onResizeTouchStart, resetSize };
}
