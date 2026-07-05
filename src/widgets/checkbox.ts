import type { Theme } from '../core/theme';
import { Widget } from '../core/widget';

export interface CheckboxConfig {
  x: number; y: number;
  width: number; height: number;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export class Checkbox extends Widget {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;

  constructor(config: CheckboxConfig) {
    super({ x: config.x, y: config.y, width: config.width, height: config.height });
    this.label = config.label;
    this.checked = config.checked ?? false;
    this.onChange = config.onChange;
    this.onClick = () => {
      if (!this.enabled) return;
      this.checked = !this.checked;
      this.onChange?.(this.checked);
      this.markDirty();
    };
  }

  render(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const boxSize = this.height;
    const spacing = 4;

    ctx.fillStyle = this.enabled ? theme.colors.surface : theme.colors.disabled;
    ctx.fillRect(0, 0, boxSize, boxSize);

    ctx.strokeStyle = this.hovered && this.enabled ? theme.colors.hover : theme.colors.border;
    ctx.strokeRect(0, 0, boxSize, boxSize);

    if (this.checked) {
      ctx.fillStyle = theme.colors.accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = theme.font;
      ctx.fillText('✓', boxSize / 2, boxSize / 2);
    }

    ctx.fillStyle = theme.colors.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = theme.font;
    ctx.fillText(this.label, boxSize + spacing, this.height / 2);

    ctx.restore();
  }
}
