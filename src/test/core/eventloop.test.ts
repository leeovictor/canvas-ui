import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { needsRedraw, markDirty, startLoop, stopLoop, resetRedraw } from '../../core/eventloop';
import { Root } from '../../core/root';
import { MockCtx } from '../helpers/mockCtx';
import { defaultTheme } from '../../core/theme';

describe('eventloop', () => {
  let rafCallback: FrameRequestCallback;
  let cancelCalled: boolean;

  beforeEach(() => {
    cancelCalled = false;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallback = cb;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {
      cancelCalled = true;
    });
    resetRedraw();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetRedraw();
  });

  describe('esqueleto', () => {
    it('starts with needsRedraw = false', () => {
      expect(needsRedraw).toBe(false);
    });

    it('markDirty sets needsRedraw to true', () => {
      markDirty();
      expect(needsRedraw).toBe(true);
    });
  });

  describe('loop', () => {
    it('renders on first frame (needsRedraw starts true)', () => {
      const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
      const spy = vi.spyOn(root, 'render');
      const ctx = new MockCtx();

      startLoop(root, ctx as unknown as CanvasRenderingContext2D, defaultTheme);

      expect(needsRedraw).toBe(true);
      rafCallback(0);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(needsRedraw).toBe(false);
    });

    it('does not render when needsRedraw is false', () => {
      const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
      const spy = vi.spyOn(root, 'render');
      const ctx = new MockCtx();

      startLoop(root, ctx as unknown as CanvasRenderingContext2D, defaultTheme);

      rafCallback(0);
      expect(spy).toHaveBeenCalledTimes(1);

      rafCallback(0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('calls clearRect before render when needsRedraw is true', () => {
      const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
      const ctx = new MockCtx();

      startLoop(root, ctx as unknown as CanvasRenderingContext2D, defaultTheme);
      rafCallback(0);

      const calls = ctx.calls;
      expect(calls[0].method).toBe('clearRect');
      expect(calls[0].args).toEqual([0, 0, 800, 600]);
    });

    it('renders again after markDirty', () => {
      const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
      const spy = vi.spyOn(root, 'render');
      const ctx = new MockCtx();

      startLoop(root, ctx as unknown as CanvasRenderingContext2D, defaultTheme);

      rafCallback(0);
      expect(spy).toHaveBeenCalledTimes(1);

      markDirty();
      rafCallback(0);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('stopLoop cancels the animation frame', () => {
      const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
      const ctx = new MockCtx();

      startLoop(root, ctx as unknown as CanvasRenderingContext2D, defaultTheme);
      stopLoop();

      expect(cancelCalled).toBe(true);
    });

    it('calls onFrame hook after each frame', () => {
      const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
      const ctx = new MockCtx();
      const onFrame = vi.fn();

      startLoop(root, ctx as unknown as CanvasRenderingContext2D, defaultTheme, onFrame);

      rafCallback(0);
      expect(onFrame).toHaveBeenCalledTimes(1);

      rafCallback(0);
      expect(onFrame).toHaveBeenCalledTimes(2);
    });
  });
});
