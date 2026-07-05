import { Widget } from '../../core/widget';
import { Container } from '../../core/container';
import { Root } from '../../core/root';

export type WidgetConfig = { x?: number; y?: number; width?: number; height?: number };

export function makeLeaf(config?: WidgetConfig): Widget {
  return new Widget({
    x: config?.x ?? 0,
    y: config?.y ?? 0,
    width: config?.width ?? 100,
    height: config?.height ?? 100,
  });
}

export function makeContainer(config?: WidgetConfig, children?: Widget[]): Container {
  const c = new Container({
    x: config?.x ?? 0,
    y: config?.y ?? 0,
    width: config?.width ?? 200,
    height: config?.height ?? 200,
  });
  if (children) {
    for (const child of children) {
      c.addChild(child);
    }
  }
  return c;
}

export function makeTree(): { root: Root; btn: Widget; panel: Container } {
  const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
  const btn = makeLeaf({ x: 10, y: 10, width: 100, height: 40 });
  const panel = makeContainer({ x: 50, y: 50, width: 300, height: 200 }, [btn]);
  root.addChild(panel);
  return { root, btn, panel };
}
