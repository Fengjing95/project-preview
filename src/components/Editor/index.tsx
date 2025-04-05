import { useCallback, useEffect, useState } from 'react'
import MonacoEditor, { OnMount } from '@monaco-editor/react'
import { WebContainerService } from '@/services/WebContainerService'
import { getFileLang } from '@/lib/getFileLang'
import { useKeyPress, usePrevious } from 'ahooks'
import { KEY_MAP } from '@/constants/keyboard'
import { useTheme } from '@/components/ThemeProvider'
import { useAtom } from 'jotai'
import { EditorModel, editorModelsAtom } from '@/store/editor'
import { editor } from 'monaco-editor'

interface EditorProps {
  filePath: string
  defaultValue?: string
  language?: string
  onChange?: (value: string) => void
}

export const Editor: React.FC<EditorProps> = ({ filePath, onChange }) => {
  const [editorInstance, setEditorInstance] = useState<Parameters<OnMount>[0] | null>(null)
  const { theme } = useTheme()
  const [modelMap, setModelMap] = useAtom(editorModelsAtom) // 编辑器模型
  const prevFilePath = usePrevious(filePath) // 生效中的文件路径

  const loadFileContent = useCallback(async () => {
    if (!editorInstance) return

    if (modelMap.has(filePath)) {
      // 如果已经存在模型，则直接使用
      const { model, state } = modelMap.get(filePath) as EditorModel
      editorInstance.setModel(model) // 设置模型
      editorInstance.restoreViewState(state) // 恢复视图状态
    } else {
      // 从 container 读取文件内容
      const container = WebContainerService.getInstance()
      const webcontainer = container.getWebContainer()

      if (!webcontainer) return
      try {
        const language = getFileLang(filePath) // 语言
        const file = await webcontainer.fs.readFile(filePath, 'utf-8')
        const content = file.toString() // 文件内容

        const model = editor.createModel(content, language) // 创建模型
        editorInstance.setModel(model)
      } catch (error) {
        console.error('Failed to read file:', error)
      }
    }
    editorInstance.focus() // 聚焦
  }, [modelMap, filePath, editorInstance])

  // 保存编辑器状态
  const saveEditor = useCallback(() => {
    if (prevFilePath && editorInstance) {
      const state = editorInstance.saveViewState() as editor.ICodeEditorViewState // 保存视图状态
      const model = editorInstance.getModel() as editor.ITextModel // 获取模型
      modelMap.set(prevFilePath, { model, state }) // 保存模型
      setModelMap(new Map(modelMap)) // 保存模型映射
    }
  }, [prevFilePath, modelMap, editorInstance])

  useEffect(() => {
    saveEditor()
    loadFileContent()
  }, [filePath, editorInstance])

  // 全局主题变化时更新编辑器主题
  useEffect(() => {
    editorInstance?.updateOptions({
      theme,
    })
  }, [theme])

  const handleEditorSave = () => {
    const value = editorInstance?.getValue() || ''

    // 保存文件内容
    const saveFile = async () => {
      const container = WebContainerService.getInstance()
      const webcontainer = container.getWebContainer()
      if (!webcontainer) return

      try {
        await webcontainer.fs.writeFile(filePath, value)
        onChange?.(value)
      } catch (error) {
        console.error('Failed to save file:', error)
      }
    }

    saveFile()
  }

  useKeyPress(KEY_MAP.save.key, handleEditorSave, { exactMatch: true })

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MonacoEditor
        theme={theme}
        height="100%"
        onMount={setEditorInstance}
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
