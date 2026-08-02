import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export interface OverlayState {
  x: number;
  y: number;
  size: number;
}

interface UseDragResizeOptions {
  initial: OverlayState;
  minSize?: number;
  maxSize?: number;
}

/**
 * Pointer-driven drag + corner-resize for a single overlay element. Built on native
 * Pointer Events (covers mouse, touch and pen) so no drag/resize library is needed.
 */
export function useDragResize({ initial, minSize = 60, maxSize = 800 }: UseDragResizeOptions) {
  const [state, setState] = useState<OverlayState>(initial);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const resizeOrigin = useRef<{ pointerX: number; pointerY: number; size: number } | null>(null);

  const startDrag = useCallback(
    (e: ReactPointerEvent) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture(e.pointerId);
      dragOrigin.current = { pointerX: e.clientX, pointerY: e.clientY, x: state.x, y: state.y };
    },
    [state.x, state.y],
  );

  const onDragMove = useCallback((e: ReactPointerEvent) => {
    if (!dragOrigin.current) return;
    const { pointerX, pointerY, x, y } = dragOrigin.current;
    setState((prev) => ({ ...prev, x: x + (e.clientX - pointerX), y: y + (e.clientY - pointerY) }));
  }, []);

  const endDrag = useCallback(() => {
    dragOrigin.current = null;
  }, []);

  const startResize = useCallback(
    (e: ReactPointerEvent) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture(e.pointerId);
      resizeOrigin.current = { pointerX: e.clientX, pointerY: e.clientY, size: state.size };
    },
    [state.size],
  );

  const onResizeMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!resizeOrigin.current) return;
      const { pointerX, pointerY, size } = resizeOrigin.current;
      const delta = (e.clientX - pointerX + (e.clientY - pointerY)) / 2;
      setState((prev) => ({ ...prev, size: Math.min(maxSize, Math.max(minSize, size + delta)) }));
    },
    [minSize, maxSize],
  );

  const endResize = useCallback(() => {
    resizeOrigin.current = null;
  }, []);

  const reset = useCallback(() => setState(initial), [initial]);

  return { state, reset, handlers: { startDrag, onDragMove, endDrag, startResize, onResizeMove, endResize } };
}
