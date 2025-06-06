import { useEffect, useMemo, useState } from 'react'
import MonacoEditor, { OnMount } from '@monaco-editor/react'
import { WebContainerService } from '@/services/WebContainerService'
import { getFileNameFromPath } from '@/lib/getFileLang'
import { useKeyPress, usePrevious } from 'ahooks'
import { KEY_MAP } from '@/constants/keyboard'
import { useTheme } from '@/components/ThemeProvider'
import { useAtomValue } from 'jotai'
import {
  IEditorModel,
  editorModelsAtom,
  ICodeEditorViewState,
  currentActiveEditorAtom,
} from '@/store/editor'
import { TabItem } from './TabItem'
import { useEditorModel } from '@/hooks'

export const Editor = () => {
  const [editorInstance, setEditorInstance] = useState<Parameters<OnMount>[0] | null>(null)
  const { theme } = useTheme()
  const modelMap = useAtomValue(editorModelsAtom) // 编辑器模型
  const filePath = useAtomValue(currentActiveEditorAtom)
  const prevFilePath = usePrevious(filePath) // 生效中的文件路径
  const { updateModel } = useEditorModel()
  // 标签页
  const tabs = useMemo(() => {
    const entries = Array.from(modelMap.entries())
    return entries.map(([path, editorModel]) => ({
      path,
      id: path,
      name: getFileNameFromPath(path),
      ...editorModel,
    }))
  }, [modelMap])

  // 保存编辑器状态
  const saveEditor = () => {
    if (prevFilePath && editorInstance) {
      const editorModel = modelMap.get(prevFilePath)
      if (!editorModel) return

      const state = editorInstance.saveViewState() as ICodeEditorViewState // 保存视图状态
      updateModel(prevFilePath, { state })
    }
  }

  useEffect(() => {
    saveEditor()
  }, [prevFilePath])

  // 加载文件内容
  const loadFileContent = async () => {
    if (!editorInstance) return

    if (modelMap.has(filePath)) {
      // 如果已经存在模型，则直接使用
      const { model, state } = modelMap.get(filePath) as IEditorModel
      editorInstance.setModel(model) // 设置模型
      if (state) editorInstance.restoreViewState(state) // 恢复视图状态
    }
    editorInstance.focus() // 聚焦
  }

  // 切换文件时加载文件内容
  useEffect(() => {
    loadFileContent()
  }, [filePath, editorInstance, modelMap])

  // 全局主题变化时更新编辑器主题
  useEffect(() => {
    editorInstance?.updateOptions({
      theme,
    })
  }, [theme])

  // 保存编辑器内容
  const handleEditorSave = () => {
    const value = editorInstance?.getValue() || ''

    // 保存文件内容
    const saveFile = async () => {
      const container = WebContainerService.getInstance()
      const webcontainer = container.getWebContainer()
      if (!webcontainer) return

      try {
        await webcontainer.fs.writeFile(filePath, value)
        updateModel(filePath, { isChanged: false })
      } catch (error) {
        console.error('Failed to save file:', error)
      }
    }

    saveFile()
  }

  useKeyPress(KEY_MAP.save.key, handleEditorSave, { exactMatch: true })

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div className="h-10 border-b flex overflow-x-auto box-content">
        {tabs.map((tab) => (
          <TabItem key={tab.path} data={tab} />
        ))}
      </div>
      <MonacoEditor
        theme={theme}
        height="100%"
        onMount={setEditorInstance}
        onChange={() => {
          updateModel(filePath, { editorType: 'pin' })
          updateModel(filePath, { isChanged: true })
        }}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
