import { useEffect, useState } from 'react'
import { WebContainerService } from '../../services/WebContainerService'
import { bindEvent, EventName, removeEvent } from '@/lib/evenemitter'
import { BiFolder, BiFolderOpen } from 'react-icons/bi'
import { getFileIcon } from '@/lib/getFileLang'
import { useSetAtom } from 'jotai'
import { currentActiveEditorAtom } from '@/store/editor'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
  path: string
}

export const FileTree = () => {
  const [files, setFiles] = useState<FileNode[]>([])
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const setCurrentActiveEditor = useSetAtom(currentActiveEditorAtom)

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
    const container = WebContainerService.getInstance()
    const webcontainer = container.getWebContainer()
    return webcontainer
  }

  async function loadRoot() {
    const webcontainer = getContainer()
    if (!webcontainer) return

    const root = await webcontainer.fs.readdir('/', { withFileTypes: true })
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
    const webcontainer = getContainer()
    if (!webcontainer) return []

    try {
      const entries = await webcontainer.fs.readdir(path, { withFileTypes: true })
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
              // TODO
              // 已存在打开的编辑器切换
              // 不存在打开的编辑器新增临时编辑器
              setCurrentActiveEditor(node.path)
            }
          }}
          onDoubleClick={() => {
            if (node.type === 'directory') {
              return
            }
            // TODO
            // 已存在打开的编辑器切换
            // 不存在打开的编辑器新增固定编辑器
            setCurrentActiveEditor(node.path)
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
