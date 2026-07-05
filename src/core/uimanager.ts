import { Widget } from './widget';
import { Root } from './root';
import { hitTestTree } from './hittest';
import { Slider } from '../widgets/slider';

export class UIManager {
  root: Root;
  canvas: HTMLCanvasElement;

  hoveredNode: Widget | null = null;
  activeNode: Widget | null = null;
  focusedNode: Widget | null = null;
  draggingNode: Widget | null = null;

  dragOffsetX: number = 0;
  dragOffsetY: number = 0;

  private _listeners: { type: string; handler: EventListener }[] = [];
  private _windowMoveHandler: ((e: MouseEvent) => void) | null = null;
  private _windowUpHandler: ((e: MouseEvent) => void) | null = null;

  constructor(root: Root, canvas: HTMLCanvasElement) {
    this.root = root;
    this.canvas = canvas;
  }

  private _getAccumulatedTranslate(node: Widget): { x: number; y: number } {
    let x = 0, y = 0;
    let current: Widget | null = node;
    while (current) {
      x += current.x;
      y += current.y;
      current = current.parent;
    }
    return { x, y };
  }

  dispatchMouseMove(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const absX = clientX - rect.left;
    const absY = clientY - rect.top;

    if (this.draggingNode) {
      const offset = this._getAccumulatedTranslate(this.draggingNode);
      const localX = absX - offset.x;
      (this.draggingNode as Slider).setValueFromLocalX(localX);
      this.root.markDirty();
      this.updateCursor();
      return;
    }

    const newTarget = hitTestTree(this.root, absX, absY);
    const effectiveTarget = (newTarget && newTarget !== this.root && newTarget.visible && newTarget.enabled)
      ? newTarget
      : null;

    if (effectiveTarget !== this.hoveredNode) {
      if (this.hoveredNode) {
        this.hoveredNode.onMouseLeave?.call(this.hoveredNode, {} as MouseEvent);
        this.hoveredNode.hovered = false;
      }
      if (effectiveTarget) {
        effectiveTarget.onMouseEnter?.call(effectiveTarget, {} as MouseEvent);
        effectiveTarget.hovered = true;
      }
      this.hoveredNode = effectiveTarget;
    }

    this.updateCursor();
    this.root.markDirty();
  }

  dispatchMouseDown(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect();
    const absX = clientX - rect.left;
    const absY = clientY - rect.top;

    const target = hitTestTree(this.root, absX, absY);
    if (target && target !== this.root && target.visible && target.enabled) {
      if (target instanceof Slider) {
        const offset = this._getAccumulatedTranslate(target);
        const localX = absX - offset.x;
        const localY = absY - offset.y;
        if (target.hitTestHandle(localX, localY)) {
          this.draggingNode = target;
          this.activeNode = target;
          target.pressed = true;
          target.markDirty();
          this._addWindowListeners();
          return;
        }
      }

      this.activeNode = target;
      target.pressed = true;
      target.markDirty();
    }
  }

  dispatchMouseUp(clientX: number, clientY: number): void {
    if (this.draggingNode) {
      (this.draggingNode as Slider).pressed = false;
      this.activeNode = null;
      this._removeWindowListeners();
      this.draggingNode = null;
      this.root.markDirty();
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const absX = clientX - rect.left;
    const absY = clientY - rect.top;

    const target = hitTestTree(this.root, absX, absY);

    if (this.activeNode) {
      if (target === this.activeNode) {
        this.activeNode.onClick?.call(this.activeNode, {} as MouseEvent);
      }
      this.activeNode.pressed = false;
      this.activeNode = null;
      this.root.markDirty();
    }
  }

  private _addWindowListeners(): void {
    this._windowMoveHandler = (e: MouseEvent) => {
      this.dispatchMouseMove(e.clientX, e.clientY);
    };
    this._windowUpHandler = (e: MouseEvent) => {
      this.dispatchMouseUp(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', this._windowMoveHandler);
    window.addEventListener('mouseup', this._windowUpHandler);
  }

  private _removeWindowListeners(): void {
    if (this._windowMoveHandler) {
      window.removeEventListener('mousemove', this._windowMoveHandler);
      this._windowMoveHandler = null;
    }
    if (this._windowUpHandler) {
      window.removeEventListener('mouseup', this._windowUpHandler);
      this._windowUpHandler = null;
    }
  }

  attach(): void {
    const onMove = (e: Event) => {
      const me = e as MouseEvent;
      this.dispatchMouseMove(me.clientX, me.clientY);
    };
    const onDown = (e: Event) => {
      const me = e as MouseEvent;
      this.dispatchMouseDown(me.clientX, me.clientY);
    };
    const onUp = (e: Event) => {
      const me = e as MouseEvent;
      this.dispatchMouseUp(me.clientX, me.clientY);
    };

    this.canvas.addEventListener('mousemove', onMove);
    this.canvas.addEventListener('mousedown', onDown);
    this.canvas.addEventListener('mouseup', onUp);

    this._listeners.push({ type: 'mousemove', handler: onMove });
    this._listeners.push({ type: 'mousedown', handler: onDown });
    this._listeners.push({ type: 'mouseup', handler: onUp });

    this.root.setUIManagerRef(this);
  }

  removeListeners(): void {
    for (const { type, handler } of this._listeners) {
      this.canvas.removeEventListener(type, handler);
    }
    this._listeners = [];
  }

  forgetNode(node: Widget): void {
    if (node === this.hoveredNode) this.hoveredNode = null;
    if (node === this.activeNode) this.activeNode = null;
    if (node === this.focusedNode) this.focusedNode = null;
    if (node === this.draggingNode) this.draggingNode = null;

    for (const child of node.children) {
      this.forgetNode(child);
    }
  }

  updateCursor(): void {
    if (this.hoveredNode && this.hoveredNode.enabled) {
      this.canvas.style.cursor = 'pointer';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }
}
