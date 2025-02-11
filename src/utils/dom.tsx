import { IServerInfo } from '@/typings/server'
import { loader } from '@monaco-editor/react'

/**
 * 根据类名获取属性值
 * @param classname 类名
 * @param propKey 属性名
 * @returns
 */
export function getPropByClass(classname: string, propKey: keyof CSSStyleDeclaration) {
  // 创建一个临时元素
  const temp = document.createElement('div')
  temp.className = classname
  document.body.appendChild(temp)

  // 获取计算后的样式
  const color = getComputedStyle(temp)[propKey]

  // 移除临时元素
  document.body.removeChild(temp)

  return color
}

/**
 * 将字符串按照指定符号分割并渲染为带样式的代码元素
 * @param text 需要分割的字符串
 * @param separator 分隔符
 * @returns JSX元素数组
 */
export const splitAndRenderCode = (text: string, separator: string = ',') => {
  // 分割字符串
  const parts = text.split(separator)

  // 返回渲染的代码元素数组
  return parts.map((part, index) => (
    <code
      key={index}
      className="inline-block px-1 py-1/2 mx-1 bg-secondary rounded font-mono text-sm"
    >
      {part.trim()}
    </code>
  ))
}

/**
 * 初始化monaco
 */
export async function initMonaco() {
  const monaco = await loader.init()

  monaco.editor.defineTheme('dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#020817',
    },
  })
}

/**
 * 判断当前页面是否在iframe中
 */
export function isUseInIframe() {
  return window !== window.top
}

/**
 * 解析WebContainer服务器URL
 * @param url WebContainer服务器URL
 * @returns 解析后的URL信息
 */
export function parseLocalUrl(url: string): IServerInfo & { port: string } {
  const regex = /^(https?:\/\/)(.+)--(\d+)--([^.]+)\.(.+)$/
  const match = url.match(regex) || []

  const [, protocol, appId, port, version, khost] = match

  return {
    protocol,
    appId,
    port,
    version,
    khost,
  }
}

/**
 * 判断url是否webContainer localUrl
 * @param url 目标url
 * @returns
 */
export function isLocalUrl(localInfo: IServerInfo, url: string) {
  const curInfo = parseLocalUrl(url)
  return (
    curInfo.appId === localInfo.appId &&
    curInfo.protocol === localInfo.protocol &&
    curInfo.version === localInfo.version &&
    curInfo.khost === localInfo.khost
  )
}
