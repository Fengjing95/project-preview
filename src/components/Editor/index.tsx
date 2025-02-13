import { useEffect, useRef } from 'react'
import MonacoEditor, { OnMount } from '@monaco-editor/react'
import { WebContainerService } from '../../services/WebContainerService'
import { getFileLang } from '@/lib/getFileLang'
import { useKeyPress } from 'ahooks'
import { KEY_MAP } from '@/constants/keyboard'
import { useTheme } from '../ThemeProvider'

interface EditorProps {
  filePath: string
  defaultValue?: string
  language?: string
  onChange?: (value: string) => void
}

export const Editor: React.FC<EditorProps> = ({ filePath, defaultValue = '', onChange }) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const container = WebContainerService.getInstance()
    const webcontainer = container.getWebContainer()

    // 读取文件内容
    const loadFileContent = async () => {
      if (!webcontainer) return
      try {
        const file = await webcontainer.fs.readFile(filePath, 'utf-8')
        if (editorRef.current) {
          editorRef.current.setValue(file.toString())
        }
      } catch (error) {
        console.error('Failed to read file:', error)
      }
    }

    loadFileContent()
  }, [filePath])

  // 全局主题变化时更新编辑器主题
  useEffect(() => {
    editorRef.current?.updateOptions({
      theme,
    })
  }, [theme])

  const handleEditorChange = () => {
    const value = editorRef.current?.getValue() || ''

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

  useKeyPress(KEY_MAP.save.key, handleEditorChange, { exactMatch: true })

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <MonacoEditor
        theme={theme}
        height="100%"
        defaultValue={defaultValue}
        language={getFileLang(filePath)}
        onMount={(editor) => {
          editorRef.current = editor
        }}
        // onChange={handleEditorChange}
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
