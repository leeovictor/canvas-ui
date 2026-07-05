import { Container } from './container';
import { Widget } from './widget';

export function hitTestTree(root: Container, absX: number, absY: number): Widget | null {
  return root.hitTest(absX, absY);
}
