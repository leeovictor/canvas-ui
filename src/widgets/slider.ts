import type { Theme } from '../core/theme';
import { Widget } from '../core/widget';

export interface SliderConfig {
  x: number; y: number;
  width: number; height: number;
  value?: number;
  onChange?: (value: number) => void;
}

export class Slider extends Widget {
  value: number;
  onChange?: (value: number) => void;

  private readonly trackHeight = 6;
  readonly handleRadius = 10;

  constructor(config: SliderConfig) {
    super({ x: config.x, y: config.y, width: config.width, height: config.height });
    this.value = config.value ?? 0;
    this.onChange = config.onChange;
  }

  get handleWidth(): number { return this.handleRadius * 2; }
  get handleHeight(): number { return this.handleRadius * 2; }

  get handleX(): number {
    const trackWidth = this.width - this.handleWidth;
    return this.value * trackWidth + this.handleRadius;
  }

  setValueFromLocalX(localX: number): void {
    const trackWidth = this.width - this.handleWidth;
    const raw = (localX - this.handleRadius) / trackWidth;
    const clamped = Math.max(0, Math.min(1, raw));
    if (clamped !== this.value) {
      this.value = clamped;
      this.onChange?.(this.value);
      this.markDirty();
    }
  }

  hitTestHandle(localX: number, localY: number): boolean {
    const hx = this.handleX;
    const hy = this.height / 2;
    const dx = localX - hx;
    const dy = localY - hy;
    return (dx * dx + dy * dy) <= this.handleRadius * this.handleRadius;
  }

  render(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const centerY = this.height / 2;
    const hx = this.handleX;

    ctx.fillStyle = this.enabled ? theme.colors.border : theme.colors.disabled;
    ctx.fillRect(0, centerY - this.trackHeight / 2, this.width, this.trackHeight);

    ctx.fillStyle = this.enabled ? theme.colors.accent : theme.colors.disabled;
    ctx.fillRect(0, centerY - this.trackHeight / 2, hx, this.trackHeight);

    ctx.beginPath();
    ctx.arc(hx, centerY, this.handleRadius, 0, Math.PI * 2);

    let fillColor: string;
    if (!this.enabled) {
      fillColor = theme.colors.disabled;
    } else if (this.pressed) {
      fillColor = theme.colors.pressed;
    } else if (this.hovered) {
      fillColor = theme.colors.hover;
    } else {
      fillColor = theme.colors.surface;
    }
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = this.enabled ? theme.colors.border : theme.colors.disabled;
    ctx.stroke();

    ctx.restore();
  }
}
