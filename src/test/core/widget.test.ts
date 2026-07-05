import { describe, it, expect } from 'vitest';
import { Widget } from '../../core/widget';
import { needsRedraw } from '../../core/eventloop';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme, type Theme } from '../../core/theme';

function makeWidget(x = 0, y = 0, w = 100, h = 100): Widget {
  return new Widget({ x, y, width: w, height: h });
}

class RenderableWidget extends Widget {
  render(ctx: CanvasRenderingContext2D, _theme: Theme): void {
    if (!this.visible) return;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

describe('Widget — hierarchy', () => {
  it('addChild sets child.parent and adds to children array', () => {
    const parent = makeWidget();
    const child = makeWidget();

    parent.addChild(child);

    expect(child.parent).toBe(parent);
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child);
  });

  it('addChild of node with existing parent removes from old parent first', () => {
    const oldParent = makeWidget();
    const newParent = makeWidget();
    const child = makeWidget();

    oldParent.addChild(child);
    expect(child.parent).toBe(oldParent);
    expect(oldParent.children).toHaveLength(1);

    newParent.addChild(child);

    expect(child.parent).toBe(newParent);
    expect(oldParent.children).toHaveLength(0);
    expect(newParent.children).toHaveLength(1);
    expect(newParent.children[0]).toBe(child);
  });

  it('removeChild sets parent to null and removes from children', () => {
    const parent = makeWidget();
    const child = makeWidget();

    parent.addChild(child);
    parent.removeChild(child);

    expect(child.parent).toBeNull();
    expect(parent.children).toHaveLength(0);
  });

  it('removeChild of non-child does nothing', () => {
    const parent = makeWidget();
    const notChild = makeWidget();

    expect(() => parent.removeChild(notChild)).not.toThrow();
    expect(parent.children).toHaveLength(0);
    expect(notChild.parent).toBeNull();
  });

  it('addChild supports multiple children', () => {
    const parent = makeWidget();
    const childA = makeWidget();
    const childB = makeWidget();

    parent.addChild(childA);
    parent.addChild(childB);

    expect(parent.children).toHaveLength(2);
    expect(parent.children[0]).toBe(childA);
    expect(parent.children[1]).toBe(childB);
    expect(childA.parent).toBe(parent);
    expect(childB.parent).toBe(parent);
  });
});

describe('Widget — render', () => {
  it('render does not throw when visible', () => {
    const widget = makeWidget();
    const ctx = new MockCtx();
    expect(() => widget.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme)).not.toThrow();
  });

  it('render does not throw when invisible', () => {
    const widget = makeWidget();
    widget.visible = false;
    const ctx = new MockCtx();
    expect(() => widget.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme)).not.toThrow();
  });

  it('visible=false prevents render from drawing', () => {
    const widget = new RenderableWidget({ x: 0, y: 0, width: 100, height: 100 });
    const ctx = new MockCtx();

    widget.visible = false;
    widget.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);

    const fillCalls = ctx.calls.filter((c) => c.method === 'fillRect');
    expect(fillCalls).toHaveLength(0);
  });

  it('visible=true allows render to draw', () => {
    const widget = new RenderableWidget({ x: 10, y: 20, width: 100, height: 50 });
    const ctx = new MockCtx();

    widget.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);

    const fillCalls = ctx.calls.filter((c) => c.method === 'fillRect');
    expect(fillCalls).toHaveLength(1);
    expect(fillCalls[0].args).toEqual([10, 20, 100, 50]);
  });
});

describe('Widget — hitTest', () => {
  it('local coords inside bounds returns self', () => {
    const w = makeWidget(0, 0, 100, 50);
    expect(w.hitTest(50, 25)).toBe(w);
  });

  it('local coords at exact boundary returns self', () => {
    const w = makeWidget(0, 0, 100, 50);
    expect(w.hitTest(100, 50)).toBe(w);
    expect(w.hitTest(0, 0)).toBe(w);
  });

  it('local coords outside bounds returns null', () => {
    const w = makeWidget(0, 0, 100, 50);
    expect(w.hitTest(101, 25)).toBeNull();
    expect(w.hitTest(50, 51)).toBeNull();
    expect(w.hitTest(-1, 25)).toBeNull();
  });

  it('hitTest returns deepest child over self', () => {
    const parent = makeWidget(0, 0, 200, 200);
    const child = makeWidget(50, 50, 100, 100);
    parent.addChild(child);

    // (75, 75) em parent → (25, 25) em child → dentro do child
    const result = parent.hitTest(75, 75);
    expect(result).toBe(child);
  });

  it('hitTest returns parent when coords are on parent but outside children', () => {
    const parent = makeWidget(0, 0, 200, 200);
    const child = makeWidget(50, 50, 100, 100);
    parent.addChild(child);

    // (10, 10) em parent → está fora do child (que começa em 50,50) → dentro do parent
    const result = parent.hitTest(10, 10);
    expect(result).toBe(parent);
  });

  it('reverse order: last child wins when overlapping', () => {
    const parent = makeWidget(0, 0, 200, 200);
    const first = makeWidget(0, 0, 100, 100);
    const second = makeWidget(0, 0, 100, 100);
    parent.addChild(first);
    parent.addChild(second);

    // Both children cover (50,50) in parent space
    // Second is iterated first (reverse order), so it should win
    const result = parent.hitTest(50, 50);
    expect(result).toBe(second);
  });

  it('hitTest is depth-first: returns most nested widget', () => {
    const grandparent = makeWidget(0, 0, 300, 300);
    const parent = makeWidget(50, 50, 200, 200);
    const child = makeWidget(50, 50, 100, 100);
    grandparent.addChild(parent);
    parent.addChild(child);

    // (120, 120) em grandparent → (70, 70) em parent → (20, 20) em child → dentro do child
    const result = grandparent.hitTest(120, 120);
    expect(result).toBe(child);
  });

  it('child out of parent bounds can still be hit', () => {
    const parent = makeWidget(0, 0, 100, 100);
    const child = makeWidget(200, 200, 50, 50);
    parent.addChild(child);

    // (220, 220) em parent → (20, 20) em child → dentro do child
    const result = parent.hitTest(220, 220);
    expect(result).toBe(child);
  });
});

describe('Widget — markDirty', () => {
  it('markDirty sets global needsRedraw to true', () => {
    const widget = makeWidget();
    widget.markDirty();
    expect(needsRedraw).toBe(true);
  });
});

describe('Widget — destroy', () => {
  it('destroy clears parent reference', () => {
    const parent = makeWidget();
    const child = makeWidget();
    parent.addChild(child);
    child.destroy();
    expect(child.parent).toBeNull();
  });

  it('destroy clears children array', () => {
    const parent = makeWidget();
    const child = makeWidget();
    parent.addChild(child);
    parent.destroy();
    expect(parent.children).toHaveLength(0);
  });

  it('destroy removes callbacks', () => {
    const w = makeWidget();
    w.onClick = () => {};
    w.onMouseEnter = () => {};
    w.onMouseLeave = () => {};
    w.destroy();
    expect(w.onClick).toBeUndefined();
    expect(w.onMouseEnter).toBeUndefined();
    expect(w.onMouseLeave).toBeUndefined();
  });

  it('destroy recursively destroys children', () => {
    const parent = makeWidget();
    const child = makeWidget();
    parent.addChild(child);

    parent.destroy();

    expect(child.parent).toBeNull();
    expect(parent.children).toHaveLength(0);
  });

  it('destroy on widget without parent does not throw', () => {
    const w = makeWidget();
    expect(() => w.destroy()).not.toThrow();
  });
});
