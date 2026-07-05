import { describe, it, expect } from 'vitest';
import { Root } from '../../core/root';
import { Widget } from '../../core/widget';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

function makeRoot(): Root {
  return new Root({ x: 0, y: 0, width: 800, height: 600 });
}

describe('Root — render', () => {
  it('does not call translate', () => {
    const root = makeRoot();
    const child = new Widget({ x: 50, y: 50, width: 100, height: 100 });
    root.addChild(child);

    const ctx = new MockCtx();
    child.render = () => { ctx.fillRect(0, 0, 10, 10); };

    root.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);

    const translateCalls = ctx.calls.filter((c) => c.method === 'translate');
    expect(translateCalls).toHaveLength(0);
  });

  it('calls render on each visible child', () => {
    const root = makeRoot();
    const childA = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    const childB = new Widget({ x: 100, y: 0, width: 100, height: 100 });
    root.addChild(childA);
    root.addChild(childB);

    let aRendered = false;
    let bRendered = false;
    childA.render = () => { aRendered = true; };
    childB.render = () => { bRendered = true; };

    const ctx = new MockCtx();
    root.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);
    expect(aRendered).toBe(true);
    expect(bRendered).toBe(true);
  });

  it('skips invisible child', () => {
    const root = makeRoot();
    const child = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    child.visible = false;
    root.addChild(child);

    let rendered = false;
    child.render = () => { rendered = true; };

    const ctx = new MockCtx();
    root.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);
    expect(rendered).toBe(false);
  });

  it('does nothing when root is invisible', () => {
    const root = makeRoot();
    root.visible = false;
    const child = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    root.addChild(child);

    let rendered = false;
    child.render = () => { rendered = true; };

    const ctx = new MockCtx();
    root.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);
    expect(rendered).toBe(false);
  });
});

describe('Root — hitTest', () => {
  it('uses absolute coordinates', () => {
    const root = makeRoot();
    const child = new Widget({ x: 50, y: 50, width: 100, height: 100 });
    root.addChild(child);

    // (75, 75) in root absolute space → (25, 25) in child space → within child
    expect(root.hitTest(75, 75)).toBe(child);
  });

  it('returns null when outside root bounds', () => {
    const root = makeRoot();
    const child = new Widget({ x: 50, y: 50, width: 100, height: 100 });
    root.addChild(child);

    expect(root.hitTest(900, 300)).toBeNull();
  });

  it('returns root when coords are in root bounds but no child', () => {
    const root = makeRoot();
    expect(root.hitTest(400, 300)).toBe(root);
  });
});
