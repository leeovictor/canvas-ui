import './style.css';
import { createDemo } from './demo/demo';
import { startLoop } from './core/eventloop';
import type { Theme } from './core/theme';

const darkTheme: Theme = {
  colors: {
    primary: '#1565c0',
    background: '#121212',
    border: '#333333',
    text: '#e0e0e0',
    hover: '#1976d2',
    pressed: '#0d47a1',
    disabled: '#616161',
    accent: '#1e88e5',
    surface: '#1e1e1e',
    placeholder: '#757575',
  },
  font: '14px sans-serif',
  fontSize: 14,
};

const canvas = document.getElementById('stage') as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext('2d')!;

const { root } = createDemo(canvas);
startLoop(root, ctx, darkTheme);
