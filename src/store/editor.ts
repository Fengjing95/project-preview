import { atom } from 'jotai'
import { editor } from 'monaco-editor'

export type EditorModel = {
  state: editor.ICodeEditorViewState // 编辑器状态
  model: editor.ITextModel // 编辑器模型
}

// Manaco Editor 模型数据
export const editorModelsAtom = atom(new Map<string, EditorModel>())

// 当前激活的编辑器
export const currentActiveEditorAtom = atom<string[]>([])
