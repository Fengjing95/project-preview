import { loader } from '@monaco-editor/react'

type MatchPromiseType<T> = T extends Promise<infer R> ? R : T
export let editor: MatchPromiseType<ReturnType<typeof loader.init>>['editor']

loader.init().then((m) => {
  editor = m.editor
  initMonaco()
})

/**
 * 初始化monaco
 */
function initMonaco() {
  editor.defineTheme('dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#020817',
    },
  })
}
