/**
 * rgb 转 hex
 * @param rgb rgb/rgba颜色
 * @returns hex颜色
 */
export function rgbToHex(rgb: string): string {
  // 匹配 rgb(r, g, b) 或 rgba(r, g, b, a) 格式
  const matches = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);
  if (!matches) return rgb;

  // 将 RGB 值转换为十六进制
  const r = parseInt(matches[1]).toString(16).padStart(2, '0');
  const g = parseInt(matches[2]).toString(16).padStart(2, '0');
  const b = parseInt(matches[3]).toString(16).padStart(2, '0');
  const a = matches[4] ? Math.round(parseFloat(matches[4]) * 255).toString(16).padStart(2, '0') : '';

  return `#${r}${g}${b}${a}`;
}