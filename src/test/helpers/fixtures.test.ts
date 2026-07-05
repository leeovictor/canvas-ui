import { describe, it, expect } from 'vitest';
import { makeLeaf, makeContainer, makeTree } from './fixtures';
import { Container } from '../../core/container';
import { Root } from '../../core/root';

describe('fixtures', () => {
  it('makeLeaf creates a Widget with default dimensions', () => {
    const leaf = makeLeaf();
    expect(leaf.x).toBe(0);
    expect(leaf.y).toBe(0);
    expect(leaf.width).toBe(100);
    expect(leaf.height).toBe(100);
  });

  it('makeLeaf accepts partial config overrides', () => {
    const leaf = makeLeaf({ x: 10, y: 20, width: 200 });
    expect(leaf.x).toBe(10);
    expect(leaf.y).toBe(20);
    expect(leaf.width).toBe(200);
    expect(leaf.height).toBe(100); // default
  });
});

describe('makeContainer', () => {
  it('creates a Container with default dimensions', () => {
    const c = makeContainer();
    expect(c).toBeInstanceOf(Container);
    expect(c.x).toBe(0);
    expect(c.y).toBe(0);
    expect(c.width).toBe(200);
    expect(c.height).toBe(200);
  });

  it('accepts config overrides', () => {
    const c = makeContainer({ x: 10, y: 20, width: 300, height: 150 });
    expect(c.x).toBe(10);
    expect(c.y).toBe(20);
    expect(c.width).toBe(300);
    expect(c.height).toBe(150);
  });

  it('accepts children', () => {
    const childA = makeLeaf({ x: 0, y: 0, width: 50, height: 50 });
    const childB = makeLeaf({ x: 100, y: 0, width: 50, height: 50 });
    const c = makeContainer({ x: 0, y: 0, width: 200, height: 200 }, [childA, childB]);

    expect(c.children).toHaveLength(2);
    expect(c.children[0]).toBe(childA);
    expect(c.children[1]).toBe(childB);
  });
});

describe('makeTree', () => {
  it('returns root, btn, and panel with correct hierarchy', () => {
    const { root, btn, panel } = makeTree();

    expect(root).toBeInstanceOf(Root);
    expect(panel).toBeInstanceOf(Container);
    expect(btn.parent).toBe(panel);
    expect(panel.parent).toBe(root);
  });

  it('positions btn inside panel correctly', () => {
    const { btn } = makeTree();
    expect(btn.x).toBe(10);
    expect(btn.y).toBe(10);
    expect(btn.width).toBe(100);
    expect(btn.height).toBe(40);
  });
});
