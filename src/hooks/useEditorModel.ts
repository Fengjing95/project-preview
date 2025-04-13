import { currentActiveEditorAtom, editorModelsAtom, IEditorModel } from '@/store/editor'
import { useAtom, useSetAtom } from 'jotai'
import { useRef } from 'react'

export function useEditorModel() {
  const [modelMap, setModelMap] = useAtom(editorModelsAtom)
  const currentPathRef = useRef('') // 当前操作的文件路径
  const setCurrentActiveEditor = useSetAtom(currentActiveEditorAtom)

  /**
   * 添加编辑器
   * @param path 路径
   * @param editorModel 编辑器模型
   */
  const addModel = (path: string, editorModel: IEditorModel) => {
    modelMap.set(path, editorModel)
    setModelMap(new Map(modelMap))
    return modelMap
  }

  /**
   * 移除编辑器
   * @param path 路径
   */
  const removeModel = (path: string) => {
    modelMap.delete(path)
    setModelMap(new Map(modelMap))
    return modelMap
  }

  /**
   * 更新编辑器
   * @param path 路径
   * @param editorModel 要更新的模型数据
   * @returns
   */
  const updateModel = (path: string, editorModelPart: Partial<IEditorModel>) => {
    const model = modelMap.get(path)
    if (!model) return

    modelMap.set(path, { ...model, ...editorModelPart })
    setModelMap(new Map(modelMap))
    return modelMap
  }

  const setCurrentEditor = (path: string) => {
    setCurrentActiveEditor(path)
    if (currentPathRef.current === path) {
      // 当前路径相同（视为双击操作）
      updateModel(path, { editorType: 'pin' })
    } else {
      // 记录并延时重置路径
      currentPathRef.current = path
      setTimeout(() => {
        currentPathRef.current = ''
      }, 150)
    }
  }

  return { addModel, removeModel, updateModel, setCurrentEditor }
}
