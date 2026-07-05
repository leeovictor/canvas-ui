import './style.css';
import { createDemo } from './demo/demo';
import { startLoop } from './core/eventloop';
import { defaultTheme } from './core/theme';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext('2d')!;

const { root } = createDemo(canvas);
startLoop(root, ctx, defaultTheme);
