import { describe, it, expect } from 'vitest';
import { Container } from '../../core/container';
import { Widget } from '../../core/widget';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

function makeContainer(x = 0, y = 0, w = 100, h = 100): Container {
  return new Container({ x, y, width: w, height: h });
}

describe('Container — render', () => {
  it('calls ctx.save before translate and ctx.restore after', () => {
    const c = makeContainer(10, 20, 100, 50);
    const ctx = new MockCtx();

    c.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);

    const calls = ctx.calls;
    expect(calls[0]).toEqual({ method: 'save', args: [] });
    expect(calls[calls.length - 1]).toEqual({ method: 'restore', args: [] });
  });

  it('calls ctx.translate with container coordinates', () => {
    const c = makeContainer(10, 20, 100, 50);
    const ctx = new MockCtx();

    c.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);

    expect(ctx.calls[1]).toEqual({ method: 'translate', args: [10, 20] });
  });

  it('calls render on each visible child', () => {
    const c = makeContainer(0, 0, 200, 200);
    const childA = new Widget({ x: 0, y: 0, width: 50, height: 50 });
    const childB = new Widget({ x: 50, y: 0, width: 50, height: 50 });
    c.addChild(childA);
    c.addChild(childB);

    const ctx = new MockCtx();
    // Spy on render by checking ctx calls - children don't draw, but Container calls save/translate/restore
    // We use a custom render spy on children
    let aRendered = false;
    let bRendered = false;
    childA.render = () => { aRendered = true; };
    childB.render = () => { bRendered = true; };

    c.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);
    expect(aRendered).toBe(true);
    expect(bRendered).toBe(true);
  });

  it('skips render on invisible child', () => {
    const c = makeContainer(0, 0, 200, 200);
    const child = new Widget({ x: 0, y: 0, width: 50, height: 50 });
    child.visible = false;
    c.addChild(child);

    let rendered = false;
    child.render = () => { rendered = true; };

    const ctx = new MockCtx();
    c.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);
    expect(rendered).toBe(false);
  });

  it('does nothing when container itself is invisible', () => {
    const c = makeContainer(10, 20, 100, 50);
    c.visible = false;
    const ctx = new MockCtx();

    c.render(ctx as unknown as CanvasRenderingContext2D, defaultTheme);
    expect(ctx.calls).toHaveLength(0);
  });
});

describe('Container — hitTest', () => {
  it('returns self when no children and coords inside bounds', () => {
    const c = makeContainer(0, 0, 100, 50);
    expect(c.hitTest(50, 25)).toBe(c);
  });

  it('returns null when no children and coords outside bounds', () => {
    const c = makeContainer(0, 0, 100, 50);
    expect(c.hitTest(101, 25)).toBeNull();
  });

  it('returns child when coords are over child', () => {
    const c = makeContainer(0, 0, 200, 200);
    const child = new Widget({ x: 50, y: 50, width: 100, height: 100 });
    c.addChild(child);

    // (75, 75) in container space → (25, 25) in child space → within child
    expect(c.hitTest(75, 75)).toBe(child);
  });

  it('returns self when coords are on container but not on any child', () => {
    const c = makeContainer(0, 0, 200, 200);
    const child = new Widget({ x: 50, y: 50, width: 100, height: 100 });
    c.addChild(child);

    expect(c.hitTest(10, 10)).toBe(c);
  });

  it('skips invisible children', () => {
    const c = makeContainer(0, 0, 200, 200);
    const child = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    child.visible = false;
    c.addChild(child);

    // Coords inside child, but child is invisible → should return container
    expect(c.hitTest(50, 50)).toBe(c);
  });

  it('skips disabled children', () => {
    const c = makeContainer(0, 0, 200, 200);
    const child = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    child.enabled = false;
    c.addChild(child);

    expect(c.hitTest(50, 50)).toBe(c);
  });

  it('reverse order: last sibling wins', () => {
    const c = makeContainer(0, 0, 200, 200);
    const first = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    const second = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    c.addChild(first);
    c.addChild(second);

    expect(c.hitTest(50, 50)).toBe(second);
  });
});
