import type { Theme } from './theme';
import { Widget } from './widget';

export class Container extends Widget {
  render(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!this.visible) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    for (const child of this.children) {
      if (!child.visible) continue;
      child.render(ctx, theme);
    }
    ctx.restore();
  }

  hitTest(localX: number, localY: number): Widget | null {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
      if (!child.visible || !child.enabled) continue;
      const childLocalX = localX - child.x;
      const childLocalY = localY - child.y;
      const hit = child.hitTest(childLocalX, childLocalY);
      if (hit) return hit;
    }
    if (localX >= 0 && localX <= this.width && localY >= 0 && localY <= this.height) {
      return this;
    }
    return null;
  }
}
