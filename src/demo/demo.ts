import { Panel } from '../widgets/panel';
import { Button } from '../widgets/button';
import { Slider } from '../widgets/slider';
import { Checkbox } from '../widgets/checkbox';
import { Root } from '../core/root';
import { UIManager } from '../core/uimanager';

interface DemoState {
  counter: number;
  red: number;
  green: number;
  blue: number;
  showHex: boolean;
  extraInfo: boolean;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function createDemo(canvas: HTMLCanvasElement): {
  root: Root;
  uiManager: UIManager;
} {
  const state: DemoState = {
    counter: 0,
    red: 0.5,
    green: 0.5,
    blue: 0.5,
    showHex: true,
    extraInfo: false,
  };

  const panel = new Panel({
    x: 40, y: 40,
    width: 480, height: 385,
    title: 'Canvas UI Demo',
  });

  // ---- Left column ----
  const LX = 10, LW = 220;

  const counterLabel = new Button({
    x: LX, y: 30,
    width: LW, height: 30,
    label: 'Contador: 0',
  });
  counterLabel.enabled = false;

  const incButton = new Button({
    x: LX, y: 68,
    width: 105, height: 36,
    label: 'Incrementar',
  });
  incButton.onClick = () => { state.counter++; updateStatus(); };

  const decButton = new Button({
    x: LX + 115, y: 68,
    width: 105, height: 36,
    label: 'Decrementar',
  });
  decButton.onClick = () => { state.counter--; updateStatus(); };

  const resetButton = new Button({
    x: LX, y: 112,
    width: LW, height: 30,
    label: 'Reset',
  });
  resetButton.onClick = () => {
    state.counter = 0;
    state.red = 0.5;
    state.green = 0.5;
    state.blue = 0.5;
    state.showHex = true;
    state.extraInfo = false;
    redSlider.value = 0.5;
    greenSlider.value = 0.5;
    blueSlider.value = 0.5;
    showHexCheckbox.checked = true;
    extraInfoCheckbox.checked = false;
    [redSlider, greenSlider, blueSlider, showHexCheckbox, extraInfoCheckbox]
      .forEach(w => w.markDirty());
    updateStatus();
  };

  const redLabel = new Button({
    x: LX, y: 156,
    width: LW, height: 20,
    label: 'Vermelho: 0.50',
  });
  redLabel.enabled = false;

  const redSlider = new Slider({
    x: LX, y: 181,
    width: LW, height: 30,
    value: state.red,
  });
  redSlider.onChange = (val) => {
    state.red = val;
    redLabel.label = `Vermelho: ${val.toFixed(2)}`;
    redLabel.markDirty();
    updateStatus();
  };

  const greenLabel = new Button({
    x: LX, y: 219,
    width: LW, height: 20,
    label: 'Verde: 0.50',
  });
  greenLabel.enabled = false;

  const greenSlider = new Slider({
    x: LX, y: 244,
    width: LW, height: 30,
    value: state.green,
  });
  greenSlider.onChange = (val) => {
    state.green = val;
    greenLabel.label = `Verde: ${val.toFixed(2)}`;
    greenLabel.markDirty();
    updateStatus();
  };

  const blueLabel = new Button({
    x: LX, y: 282,
    width: LW, height: 20,
    label: 'Azul: 0.50',
  });
  blueLabel.enabled = false;

  const blueSlider = new Slider({
    x: LX, y: 307,
    width: LW, height: 30,
    value: state.blue,
  });
  blueSlider.onChange = (val) => {
    state.blue = val;
    blueLabel.label = `Azul: ${val.toFixed(2)}`;
    blueLabel.markDirty();
    updateStatus();
  };

  // ---- Right column ----
  const RX = 250, RW = 220;

  const infoLabel1 = new Button({
    x: 15, y: 24,
    width: 190, height: 24,
    label: 'Contador: 0',
  });
  infoLabel1.enabled = false;

  const infoLabel2 = new Button({
    x: 15, y: 56,
    width: 190, height: 24,
    label: 'RGB: (0.50, 0.50, 0.50)',
  });
  infoLabel2.enabled = false;

  const infoLabel3 = new Button({
    x: 15, y: 88,
    width: 190, height: 24,
    label: 'HEX: #804080',
  });
  infoLabel3.enabled = false;

  const infoPanel = new Panel({
    x: RX, y: 30,
    width: RW, height: 120,
    title: 'Informações',
  });
  infoPanel.addChild(infoLabel1);
  infoPanel.addChild(infoLabel2);
  infoPanel.addChild(infoLabel3);

  const showHexCheckbox = new Checkbox({
    x: 10, y: 24,
    width: 200, height: 24,
    label: 'Mostrar HEX',
    checked: state.showHex,
  });
  showHexCheckbox.onChange = (checked) => {
    state.showHex = checked;
    updateStatus();
  };

  const extraInfoCheckbox = new Checkbox({
    x: 10, y: 56,
    width: 200, height: 24,
    label: 'Info extra',
    checked: state.extraInfo,
  });
  extraInfoCheckbox.onChange = (checked) => {
    state.extraInfo = checked;
    updateStatus();
  };

  const logButton = new Button({
    x: 10, y: 88,
    width: 200, height: 36,
    label: 'Log Estado',
  });
  logButton.onClick = () => {
    console.log('=== Estado Atual ===');
    console.log('Contador:', state.counter);
    console.log('RGB:', `(${state.red.toFixed(2)}, ${state.green.toFixed(2)}, ${state.blue.toFixed(2)})`);
    console.log('HEX:', rgbToHex(state.red, state.green, state.blue));
    console.log('Mostrar HEX:', state.showHex);
    console.log('Info extra:', state.extraInfo);
    console.log('====================');
  };

  const settingsPanel = new Panel({
    x: RX, y: 160,
    width: RW, height: 135,
    title: 'Configurações',
  });
  settingsPanel.addChild(showHexCheckbox);
  settingsPanel.addChild(extraInfoCheckbox);
  settingsPanel.addChild(logButton);

  // ---- Bottom status bar ----
  const statusLabel = new Button({
    x: 10, y: 345,
    width: 460, height: 28,
    label: 'Contador: 0  |  RGB: (0.50, 0.50, 0.50)  |  HEX: #804080',
  });
  statusLabel.enabled = false;

  function updateStatus() {
    const hex = rgbToHex(state.red, state.green, state.blue);

    counterLabel.label = `Contador: ${state.counter}`;
    counterLabel.markDirty();

    infoLabel1.label = `Contador: ${state.counter}`;
    infoLabel1.markDirty();

    infoLabel2.label = `RGB: (${state.red.toFixed(2)}, ${state.green.toFixed(2)}, ${state.blue.toFixed(2)})`;
    infoLabel2.markDirty();

    infoLabel3.visible = state.showHex;
    if (state.showHex) {
      infoLabel3.label = `HEX: ${hex}`;
      infoLabel3.markDirty();
    }

    let s = `Contador: ${state.counter}  |  RGB: (${state.red.toFixed(2)}, ${state.green.toFixed(2)}, ${state.blue.toFixed(2)})`;
    if (state.showHex) s += `  |  HEX: ${hex}`;
    if (state.extraInfo) s += `  |  Extra: ON`;
    statusLabel.label = s;
    statusLabel.markDirty();
  }

  panel.addChild(counterLabel);
  panel.addChild(incButton);
  panel.addChild(decButton);
  panel.addChild(resetButton);
  panel.addChild(redLabel);
  panel.addChild(redSlider);
  panel.addChild(greenLabel);
  panel.addChild(greenSlider);
  panel.addChild(blueLabel);
  panel.addChild(blueSlider);
  panel.addChild(infoPanel);
  panel.addChild(settingsPanel);
  panel.addChild(statusLabel);

  const root = new Root({ x: 0, y: 0, width: 800, height: 600 });
  root.addChild(panel);

  const uiManager = new UIManager(root, canvas);
  uiManager.attach();

  return { root, uiManager };
}
