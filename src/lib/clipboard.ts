/**
 * 复制文本到剪贴板
 * @param text 文本
 */
export async function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text)
}
