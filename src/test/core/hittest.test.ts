import { describe, it, expect } from 'vitest';
import { hitTestTree } from '../../core/hittest';
import { Root } from '../../core/root';
import { Container } from '../../core/container';
import { Widget } from '../../core/widget';

describe('hitTestTree', () => {
  it('3-level tree: root → container → leaf', () => {
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const container = new Container({ x: 50, y: 50, width: 200, height: 200 });
    const leaf = new Widget({ x: 50, y: 50, width: 100, height: 100 });
    root.addChild(container);
    container.addChild(leaf);

    // (120, 120) in root space → (70, 70) in container → (20, 20) in leaf → within leaf
    expect(hitTestTree(root, 120, 120)).toBe(leaf);
  });

  it('two overlapping children: returns last (reverse order)', () => {
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const first = new Widget({ x: 10, y: 10, width: 200, height: 200 });
    const second = new Widget({ x: 10, y: 10, width: 200, height: 200 });
    root.addChild(first);
    root.addChild(second);

    expect(hitTestTree(root, 100, 100)).toBe(second);
  });

  it('coordinate outside all widgets returns null', () => {
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const leaf = new Widget({ x: 100, y: 100, width: 50, height: 50 });
    root.addChild(leaf);

    expect(hitTestTree(root, 900, 600)).toBeNull();
  });

  it('invisible child is skipped, falls through to visible parent', () => {
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const container = new Container({ x: 0, y: 0, width: 100, height: 100 });
    const leaf = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    leaf.visible = false;
    container.addChild(leaf);
    root.addChild(container);

    // Coordinate hits container bounds, but invisible child should be skipped
    // Should return container, not the invisible leaf
    expect(hitTestTree(root, 50, 50)).toBe(container);
  });

  it('4 levels deep: returns deepest node', () => {
    const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
    const l1 = new Container({ x: 0, y: 0, width: 400, height: 400 });
    const l2 = new Container({ x: 0, y: 0, width: 200, height: 200 });
    const l3 = new Widget({ x: 0, y: 0, width: 100, height: 100 });
    root.addChild(l1);
    l1.addChild(l2);
    l2.addChild(l3);

    expect(hitTestTree(root, 50, 50)).toBe(l3);
  });
});
