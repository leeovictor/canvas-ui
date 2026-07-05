export interface ThemeColors {
  primary: string;
  background: string;
  border: string;
  text: string;
  hover: string;
  pressed: string;
  disabled: string;
  accent: string;
  surface: string;
}

export interface Theme {
  colors: ThemeColors;
  font: string;
  fontSize: number;
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#1890ff',
    background: '#ffffff',
    border: '#d9d9d9',
    text: '#000000',
    hover: '#40a9ff',
    pressed: '#096dd9',
    disabled: '#d9d9d9',
    accent: '#722ed1',
    surface: '#f5f5f5',
  },
  font: '14px sans-serif',
  fontSize: 14,
};
