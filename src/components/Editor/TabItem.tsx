import { currentActiveEditorAtom, IEditorModel } from '@/store/editor'
import { MyTooltip, MyDialog } from '../'
import { getFileIcon, getFileNameFromPath } from '@/lib/getFileLang'
import { cn } from '@/lib/utils'
import { VscClose } from 'react-icons/vsc'
import { useEditorModel } from '@/hooks'
import { useAtom } from 'jotai'

interface IProps {
  data: {
    path: string
  } & IEditorModel
}

export function TabItem(props: IProps) {
  const { data } = props
  const name = getFileNameFromPath(data.path)
  const icon = getFileIcon(name)
  const { removeModel, setCurrentEditor } = useEditorModel()
  const [currentActiveEditor, setCurrentActiveEditor] = useAtom(currentActiveEditorAtom)

  function handleRemove(e: React.MouseEvent<SVGElement, MouseEvent>) {
    if (data.isChanged) {
      MyDialog.alert({
        title: '提示',
        content: '文件未保存，直接关闭？',
        onConfirm: () => {
          const modelMap = removeModel(data.path)
          if (data.path === currentActiveEditor) {
            // 当前激活的编辑器被关闭，切换到上一个编辑器
            const keys = Array.from(modelMap.keys())
            const prevPath = keys[keys.length - 1]
            setCurrentActiveEditor(prevPath)
          }
        },
      })
    }
    e.stopPropagation()
  }

  return (
    <MyTooltip message={data.path}>
      <div
        onClick={() => setCurrentEditor(data.path)}
        className={cn([
          'flex',
          'items-center',
          'px-2',
          'gap-1',
          { italic: data.editorType === 'temporary' },
          'group/container',
          'cursor-pointer',
          currentActiveEditor === data.path ? 'bg-accent' : 'bg-background',
          'select-none',
        ])}
      >
        {icon}
        {name}
        <div className="relative w-3 h-3 group/close">
          <VscClose
            onClick={handleRemove}
            className={cn([
              'absolute',
              'p-0.5',
              'rounded',
              currentActiveEditor === data.path ? 'opacity-100' : 'opacity-0',
              'group-hover/container:opacity-100',
              'hover:bg-popover',
            ])}
          />
          {data.isChanged && (
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-primary group-hover/close:hidden" />
          )}
        </div>
      </div>
    </MyTooltip>
  )
}
