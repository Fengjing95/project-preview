import { ITheme } from '@xterm/xterm'

// 亮色主题配置
const lightTheme: ITheme = {
  foreground: '#2c3e50',
  background: '#ffffff',
  cursor: '#2c3e50',
  cursorAccent: '#ffffff',
  black: '#000000',
  red: '#e74c3c',
  green: '#27ae60',
  yellow: '#f39c12',
  blue: '#3498db',
  magenta: '#9b59b6',
  cyan: '#1abc9c',
  white: '#ffffff',
  brightBlack: '#666666',
  brightRed: '#ff3830',
  brightGreen: '#2ecc71',
  brightYellow: '#f1c40f',
  brightBlue: '#3498db',
  brightMagenta: '#9b59b6',
  brightCyan: '#1abc9c',
  brightWhite: '#ffffff'
}

// 暗色主题配置
const darkTheme: ITheme = {
  foreground: '#f8f8f2',
  background: '#121212',
  cursor: '#f8f8f2',
  cursorAccent: '#121212',
  black: '#21222c',
  red: '#ff5555',
  green: '#50fa7b',
  yellow: '#f1fa8c',
  blue: '#bd93f9',
  magenta: '#ff79c6',
  cyan: '#8be9fd',
  white: '#f8f8f2',
  brightBlack: '#6272a4',
  brightRed: '#ff6e6e',
  brightGreen: '#69ff94',
  brightYellow: '#ffffa5',
  brightBlue: '#d6acff',
  brightMagenta: '#ff92df',
  brightCyan: '#a4ffff',
  brightWhite: '#ffffff'
}

export const XTERM_THEME = {
  light: lightTheme,
  dark: darkTheme
}
