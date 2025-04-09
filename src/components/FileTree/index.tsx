import { useEffect, useState } from 'react'
import { WebContainerService } from '../../services/WebContainerService'
import { bindEvent, EventName, removeEvent } from '@/lib/evenemitter'
import { BiFolder, BiFolderOpen } from 'react-icons/bi'
import { getFileIcon, getFileLang } from '@/lib/getFileLang'
import { useAtomValue } from 'jotai'
import { editorModelsAtom } from '@/store/editor'
import { editor } from '@/lib/editor'
import { useEditorModel } from '@/hooks'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
  path: string
}

export const FileTree = () => {
  const [files, setFiles] = useState<FileNode[]>([])
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const modelMap = useAtomValue(editorModelsAtom)
  const { addModel, setCurrentEditor } = useEditorModel()

  function sortNodes(nodes: FileNode[]): FileNode[] {
    const directories = nodes
      .filter((node) => node.type === 'directory')
      .sort((a, b) => a.name.localeCompare(b.name))
    const files = nodes
      .filter((node) => node.type === 'file')
      .sort((a, b) => a.name.localeCompare(b.name))

    // 递归排序子目录
    directories.forEach((dir) => {
      if (dir.children) {
        dir.children = sortNodes(dir.children)
      }
    })

    return [...directories, ...files]
  }

  function getContainer() {
    const webContainerService = WebContainerService.getInstance()
    const webContainer = webContainerService.getWebContainer()
    return webContainer
  }

  async function loadRoot() {
    const webContainer = getContainer()
    if (!webContainer) return

    const root = await webContainer.fs.readdir('/', { withFileTypes: true })
    const fileTree = await Promise.all(
      root.map(async (entry) => {
        const node: FileNode = {
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          path: `/${entry.name}`,
        }

        if (entry.isDirectory()) {
          node.children = await loadDirectory(node.path)
        }

        return node
      }),
    )

    setFiles(sortNodes(fileTree))
  }

  const loadDirectory = async (path: string): Promise<FileNode[]> => {
    const webContainer = getContainer()
    if (!webContainer) return []

    try {
      const entries = await webContainer.fs.readdir(path, { withFileTypes: true })
      const nodes = await Promise.all(
        entries.map(async (entry) => {
          const entryPath = `${path}/${entry.name}`
          const node: FileNode = {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            path: entryPath,
          }

          if (entry.isDirectory()) {
            node.children = await loadDirectory(entryPath)
          }

          return node
        }),
      )

      return sortNodes(nodes)
    } catch (error) {
      console.error(`Failed to load directory ${path}:`, error)
      return []
    }
  }

  useEffect(() => {
    bindEvent(EventName.MOUNTED, loadRoot)
    bindEvent(EventName.INSTALLED, loadRoot)
    bindEvent(EventName.FILE_CHANGE, loadRoot)

    return () => {
      removeEvent(EventName.MOUNTED)
      removeEvent(EventName.INSTALLED)
      removeEvent(EventName.FILE_CHANGE)
    }
  }, [])

  // 文件夹开合控制
  const toggleDirectory = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  /**
   * 打开编辑器
   * @param path 文件路径
   * @param type 编辑器类型 pin-固定编辑器 temporary-临时编辑器
   */
  const openEditor = async (path: string, type?: 'pin' | 'temporary') => {
    const temporaryEditorPath = Array.from(modelMap.entries()).find(
      (model) => model[1].editorType === 'temporary',
    )?.[0]
    if (!modelMap.has(path)) {
      // 移除原有临时编辑器
      if (temporaryEditorPath) {
        modelMap.delete(temporaryEditorPath)
      }
      // 未打开当前文件，创建编辑器模型
      const content = await WebContainerService.getInstance().readFile(path) // 读取文件内容
      const language = getFileLang(path) // 语言
      const model = editor.createModel(content, language) // 创建模型
      if (type === 'pin') {
        // 新增固定编辑器
        addModel(path, { model, isChanged: false, editorType: 'pin' })
      } else {
        // 新增临时编辑器
        addModel(path, { model, isChanged: false, editorType: 'temporary' })
      }
    }
    // 切换编辑器
    setCurrentEditor(path)
  }

  const renderNode = (node: FileNode) => {
    const isExpanded = expandedDirs.has(node.path)

    return (
      <div key={node.path} className="text-sm">
        <div
          className="p-1 pl-2 flex items-center cursor-pointer rounded"
          onClick={() => {
            if (node.type === 'directory') {
              toggleDirectory(node.path)
            } else {
              // 打开临时编辑器
              openEditor(node.path, 'temporary')
            }
          }}
          onDoubleClick={() => {
            if (node.type === 'directory') {
              return
            }
            // 打开固定编辑器
            openEditor(node.path, 'pin')
          }}
        >
          <span className="mr-2">
            {node.type === 'directory' ? (
              isExpanded ? (
                <BiFolderOpen />
              ) : (
                <BiFolder />
              )
            ) : (
              getFileIcon(node.name)
            )}
          </span>
          <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {node.name}
          </span>
        </div>
        {node.type === 'directory' && isExpanded && node.children && (
          <div className="pl-4">{node.children.map(renderNode)}</div>
        )}
      </div>
    )
  }

  return <div className="w-full h-full select-none overflow-auto">{files.map(renderNode)}</div>
}
