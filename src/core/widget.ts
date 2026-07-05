import type { Theme } from './theme';
import type { UIManager } from './uimanager';
import { markDirty as scheduleRedraw } from './eventloop';

export class Widget {
  uiManagerRef?: UIManager;
  x: number;
  y: number;
  width: number;
  height: number;

  parent: Widget | null = null;
  children: Widget[] = [];

  visible: boolean = true;
  enabled: boolean = true;

  hovered: boolean = false;
  pressed: boolean = false;
  focused: boolean = false;

  onClick?: (this: Widget, e: MouseEvent) => void;
  onMouseEnter?: (this: Widget, e: MouseEvent) => void;
  onMouseLeave?: (this: Widget, e: MouseEvent) => void;

  constructor(config: { x: number; y: number; width: number; height: number }) {
    this.x = config.x;
    this.y = config.y;
    this.width = config.width;
    this.height = config.height;
  }

  setUIManagerRef(ui: UIManager | null): void {
    this.uiManagerRef = ui ?? undefined;
    for (const child of this.children) {
      child.setUIManagerRef(ui);
    }
  }

  addChild(child: Widget): void {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
    if (this.uiManagerRef) {
      child.setUIManagerRef(this.uiManagerRef);
    }
  }

  removeChild(child: Widget): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.uiManagerRef?.forgetNode(child);
      child.setUIManagerRef(null);
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  render(_ctx: CanvasRenderingContext2D, _theme: Theme): void {
    if (!this.visible) return;
  }

  hitTest(localX: number, localY: number): Widget | null {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i];
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

  markDirty(): void {
    scheduleRedraw();
  }

  destroy(): void {
    for (const child of this.children) {
      child.destroy();
    }
    this.uiManagerRef?.forgetNode(this);
    this.children = [];
    this.parent = null;
    this.onClick = undefined;
    this.onMouseEnter = undefined;
    this.onMouseLeave = undefined;
  }
}
