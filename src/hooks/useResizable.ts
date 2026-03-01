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

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      setSize({
        width: Math.min(maxSize.width, Math.max(minSize.width, startSize.current.width + dx)),
        height: Math.min(maxSize.height, Math.max(minSize.height, startSize.current.height + dy)),
      });
    };

    const onMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [minSize, maxSize]);

  return { size, onResizeStart };
}
