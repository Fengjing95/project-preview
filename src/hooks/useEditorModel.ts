import { editorModelsAtom, IEditorModel } from '@/store/editor'
import { useAtom } from 'jotai'

export function useEditorModel() {
  const [modelMap, setModelMap] = useAtom(editorModelsAtom)

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

  return { addModel, removeModel, updateModel }
}
