import type { Theme } from '../core/theme';
import { Widget } from '../core/widget';

export interface ButtonConfig {
  x: number; y: number;
  width: number; height: number;
  label: string;
  onClick?: () => void;
}

export class Button extends Widget {
  label: string;
  onClick?: () => void;

  constructor(config: ButtonConfig) {
    super({ x: config.x, y: config.y, width: config.width, height: config.height });
    this.label = config.label;
    this.onClick = config.onClick;
  }

  render(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    let fillColor: string;
    if (!this.enabled) {
      fillColor = theme.colors.disabled;
    } else if (this.pressed) {
      fillColor = theme.colors.pressed;
    } else if (this.hovered) {
      fillColor = theme.colors.hover;
    } else {
      fillColor = theme.colors.primary;
    }

    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.hovered && this.enabled) {
      ctx.strokeStyle = theme.colors.hover;
      ctx.strokeRect(0, 0, this.width, this.height);
    }

    ctx.fillStyle = theme.colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.width / 2, this.height / 2);

    ctx.restore();
  }
}
