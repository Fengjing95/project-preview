import { loader } from "@monaco-editor/react";
import { rgbToHex } from "./color";

/**
 * 根据类名获取属性值
 * @param classname 类名
 * @returns 
 */
export function getPropByClass(classname: string, propKey: keyof CSSStyleDeclaration) {
  // 创建一个临时元素
  const temp = document.createElement('div');
  temp.className = classname;
  document.body.appendChild(temp);

  // 获取计算后的样式
  const color = getComputedStyle(temp)[propKey];

  // 移除临时元素
  document.body.removeChild(temp);

  return color;
}

/**
 * 将字符串按照指定符号分割并渲染为带样式的代码元素
 * @param text 需要分割的字符串
 * @param separator 分隔符
 * @returns JSX元素数组
 */
export const splitAndRenderCode = (text: string, separator: string = ',') => {
  // 分割字符串
  const parts = text.split(separator);

  // 返回渲染的代码元素数组
  return parts.map((part, index) => (
    <code
      key={index}
      className="inline-block px-1 py-1/2 mx-1 bg-gray-100 rounded font-mono text-sm"
    >
      {part.trim()}
    </code>
  ));
};

/**
 * 初始化monaco
 */
export async function initMonaco() {
  const monaco = await loader.init()

  const background = rgbToHex(getPropByClass('bg-slate-900', 'backgroundColor') as string)
  monaco.editor.defineTheme('customTheme', {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": background,
    },
  })
}
