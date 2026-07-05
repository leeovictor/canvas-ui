import type { Theme } from '../core/theme';
import { Widget } from '../core/widget';

export interface InputConfig {
  x: number; y: number;
  width: number; height: number;
  value?: string;
  placeholder?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}

export class Input extends Widget {
  value: string;
  placeholder: string;
  maxLength: number;
  caretIndex: number;
  onChange?: (value: string) => void;

  private _blinkVisible: boolean = false;
  private _blinkTimer: number | null = null;

  static readonly BLINK_INTERVAL = 530;
  static readonly PADDING = 6;
  static readonly CARET_WIDTH = 1.5;

  constructor(config: InputConfig) {
    super({ x: config.x, y: config.y, width: config.width, height: config.height });
    this.value = config.value ?? '';
    this.placeholder = config.placeholder ?? '';
    this.maxLength = config.maxLength ?? Infinity;
    this.caretIndex = this.value.length;
    this.onChange = config.onChange;
  }

  handleFocus(): void {
    this._startBlink();
  }

  handleBlur(): void {
    this._stopBlink();
    this.caretIndex = this.value.length;
  }

  private _startBlink(): void {
    this._blinkVisible = true;
    this._blinkTimer = setInterval(() => {
      this._blinkVisible = !this._blinkVisible;
      this.markDirty();
    }, Input.BLINK_INTERVAL);
  }

  private _stopBlink(): void {
    if (this._blinkTimer !== null) {
      clearInterval(this._blinkTimer);
      this._blinkTimer = null;
    }
    this._blinkVisible = false;
  }

  private _restartBlink(): void {
    this._blinkVisible = true;
    if (this._blinkTimer !== null) {
      clearInterval(this._blinkTimer);
    }
    this._blinkTimer = setInterval(() => {
      this._blinkVisible = !this._blinkVisible;
      this.markDirty();
    }, Input.BLINK_INTERVAL);
  }

  handleKeyDown(e: KeyboardEvent): boolean {
    if (!this.enabled) return false;

    let changed = false;

    if (e.key === 'Backspace') {
      if (this.caretIndex > 0) {
        this.value = this.value.slice(0, this.caretIndex - 1) + this.value.slice(this.caretIndex);
        this.caretIndex--;
        changed = true;
      }
    } else if (e.key === 'Delete') {
      if (this.caretIndex < this.value.length) {
        this.value = this.value.slice(0, this.caretIndex) + this.value.slice(this.caretIndex + 1);
        changed = true;
      }
    } else if (e.key === 'ArrowLeft') {
      if (this.caretIndex > 0) {
        this.caretIndex--;
        this._restartBlink();
      }
    } else if (e.key === 'ArrowRight') {
      if (this.caretIndex < this.value.length) {
        this.caretIndex++;
        this._restartBlink();
      }
    } else if (e.key === 'Home') {
      this.caretIndex = 0;
      this._restartBlink();
    } else if (e.key === 'End') {
      this.caretIndex = this.value.length;
      this._restartBlink();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (this.value.length < this.maxLength) {
        this.value = this.value.slice(0, this.caretIndex) + e.key + this.value.slice(this.caretIndex);
        this.caretIndex++;
        changed = true;
      }
    }

    if (changed) {
      this.onChange?.(this.value);
      this.markDirty();
      this._restartBlink();
      return true;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
      this.markDirty();
      return true;
    }

    return false;
  }

  render(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const padding = Input.PADDING;

    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.strokeStyle = this.enabled
      ? (this.focused ? theme.colors.primary : theme.colors.border)
      : theme.colors.disabled;
    ctx.strokeRect(0, 0, this.width, this.height);

    const textX = padding;
    const textY = this.height / 2;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = theme.font;

    if (this.value.length > 0) {
      ctx.fillStyle = this.enabled ? theme.colors.text : theme.colors.disabled;
      ctx.fillText(this.value, textX, textY);
    } else if (this.placeholder) {
      ctx.fillStyle = theme.colors.placeholder;
      ctx.fillText(this.placeholder, textX, textY);
    }

    if (this.focused && this._blinkVisible && this.enabled) {
      const textBeforeCaret = this.value.slice(0, this.caretIndex);
      const caretX = textX + ctx.measureText(textBeforeCaret).width;
      ctx.fillStyle = theme.colors.text;
      ctx.fillRect(caretX, padding - 2, Input.CARET_WIDTH, this.height - padding * 2 + 4);
    }

    ctx.restore();
  }

  destroy(): void {
    this._stopBlink();
    super.destroy();
  }
}
