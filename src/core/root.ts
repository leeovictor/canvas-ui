import type { Theme } from './theme';
import { Container } from './container';
import { Widget } from './widget';

export class Root extends Container {
  hitTest(absX: number, absY: number): Widget | null {
    return super.hitTest(absX, absY);
  }

  render(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!this.visible) return;
    for (const child of this.children) {
      if (!child.visible) continue;
      child.render(ctx, theme);
    }
  }
}
