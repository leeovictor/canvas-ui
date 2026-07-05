import type { Root } from './root';
import type { Theme } from './theme';

export let needsRedraw = false;
let rafHandle: number | null = null;

export function markDirty(): void {
  needsRedraw = true;
}

export function startLoop(
  root: Root,
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  onFrame?: () => void,
): void {
  function loop() {
    if (needsRedraw) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      root.render(ctx, theme);
      needsRedraw = false;
    }
    onFrame?.();
    rafHandle = requestAnimationFrame(loop);
  }
  needsRedraw = true;
  rafHandle = requestAnimationFrame(loop);
}

export function stopLoop(): void {
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }
}

/** @internal */
export function resetRedraw(): void {
  needsRedraw = false;
}
