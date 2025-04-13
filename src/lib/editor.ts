import { loader } from '@monaco-editor/react'

export const monaco = await loader.init()

export const editor = monaco.editor

/**
 * 初始化monaco
 */
export async function initMonaco() {
  editor.defineTheme('dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#020817',
    },
  })
}
