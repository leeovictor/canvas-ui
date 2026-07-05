import type { Theme } from '../core/theme';
import { Container } from '../core/container';
import { Widget } from '../core/widget';

export interface PanelConfig {
  x: number; y: number;
  width: number; height: number;
  title?: string;
  children?: Widget[];
}

export class Panel extends Container {
  title?: string;

  constructor(config: PanelConfig) {
    super({ x: config.x, y: config.y, width: config.width, height: config.height });
    this.title = config.title;
    if (config.children) {
      for (const child of config.children) {
        this.addChild(child);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!this.visible) return;
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = theme.colors.surface;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = theme.colors.border;
    ctx.strokeRect(0, 0, this.width, this.height);

    if (this.title) {
      ctx.fillStyle = theme.colors.text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = theme.font;
      ctx.fillText(this.title, 8, 8);
    }

    for (const child of this.children) {
      if (!child.visible) continue;
      child.render(ctx, theme);
    }

    ctx.restore();
  }
}
