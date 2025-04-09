import { atom } from 'jotai'
import { editor } from '@/lib/editor'

export type ICodeEditorViewState = NonNullable<
  ReturnType<ReturnType<typeof editor.create>['saveViewState']>
>
export type ITextModel = ReturnType<typeof editor.createModel>

export type IEditorModel = {
  state: ICodeEditorViewState // 编辑器状态
  model: ITextModel // 编辑器模型
  isChanged: boolean // 是否被修改
}

// Manaco Editor 模型数据
export const editorModelsAtom = atom(new Map<string, IEditorModel>())

// 当前激活的编辑器
export const currentActiveEditorAtom = atom<string>('')
